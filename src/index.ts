import { promises as fs } from 'fs'
import { basename, join, resolve, dirname } from 'path'
import { Plugin, ResolvedConfig } from 'vite'
import { compilePSVG } from '@lingdong/psvg'
import hash_sum from 'hash-sum'
import slash from 'slash'
import SVGO from 'svgo'
import { Options } from './types'

export function isPSVG(id: string) {
  return id.endsWith('.psvg')
}

function VitePluginPSVG(options: Options = {}): Plugin {
  let config: ResolvedConfig

  const {
    minification = true,
  } = options

  const assets = new Map<string, string>()
  const svgo = new SVGO()

  return {
    name: 'vite-plugin-psvg',
    configResolved(_config) {
      config = _config
    },
    resolveId(id, importer) {
      if (config.command === 'serve')
        return
      return isPSVG(id)
        ? resolve((importer && dirname(importer)) || '.', id)
        : null
    },
    async load(id) {
      if (config.command === 'serve')
        return
      if (!isPSVG(id))
        return

      let svg = compilePSVG(await fs.readFile(id, 'utf-8'))

      if (minification)
        svg = (await svgo.optimize(svg)).data

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
          isAsset: true,
          type: 'asset',
          fileName: join(config.build.assetsDir, fileName),
          source,
        }
      }
    },
  }
}

export default VitePluginPSVG
