import { existsSync, promises as fs } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'
import { compilePSVG } from '@lingdong/psvg'
import hash_sum from 'hash-sum'
import slash from 'slash'
import { optimize } from 'svgo'
import type { Options } from './types'

export function isPSVG(id: string) {
  return id.endsWith('.psvg')
}

function VitePluginPSVG(options: Options = {}): Plugin {
  let config: ResolvedConfig

  const {
    minification = true,
  } = options

  const assets = new Map<string, string>()

  return {
    name: 'vite-plugin-psvg',
    configResolved(_config) {
      config = _config
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url
        if (url && isPSVG(url)) {
          const filepath = url.startsWith('/@fs/')
            ? url.slice(4)
            : join(config.root, url)
          if (!existsSync)
            return next()

          let svg = compilePSVG(await fs.readFile(filepath, 'utf-8'))
          if (minification)
            svg = (await optimize(svg)).data
          if (svg) {
            res.setHeader('Content-Type', 'image/svg+xml')
            res.end(svg)
            return
          }
        }
        next()
      })
    },
    resolveId(id, importer) {
      if (config.command !== 'build')
        return
      return isPSVG(id)
        ? resolve((importer && dirname(importer)) || '.', id)
        : null
    },
    async load(id) {
      if (config.command !== 'build')
        return
      if (!isPSVG(id))
        return

      let svg = compilePSVG(await fs.readFile(id, 'utf-8'))

      if (minification)
        svg = (await optimize(svg)).data

      const baseName = basename(id, '.psvg')
      const resolvedFileName = `${baseName}.${hash_sum(id)}.svg`
      const url = config.base + slash(join(config.build.assetsDir, resolvedFileName))

      assets.set(resolvedFileName, svg)

      return `export default ${JSON.stringify(url)}`
    },
    generateBundle(_options, bundle) {
      for (const [fileName, source] of assets) {
        bundle[fileName] = {
          name: fileName,
          type: 'asset',
          fileName: join(config.build.assetsDir, fileName),
          source,
          needsCodeReference: true,
        }
      }
    },
  }
}

export default VitePluginPSVG
