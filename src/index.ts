import { readFile, stat } from 'fs/promises'
import path from 'path'
import type { Plugin } from 'vite'
import { compilePSVG } from '@antfu/psvg'
import hash_sum from 'hash-sum'
import slash from 'slash'

export interface Options {
  /**
   * Base public path when served in production.
   * @default '/'
   */
  base?: string
  /**
   * Directory relative from `outDir` where the built js/css/image assets will
   * be placed.
   * @default '_assets'
   */
  assetsDir?: string

  /**
   * Reload page on psvg file changed. Vite does not support asset hmr atm.
   *
   * @default
   */
  autoReload?: boolean
}

function isPSVG(id: string) {
  return id.endsWith('.psvg')
}

function VitePluginPSVG(options: Options = {}): Plugin {
  const {
    base = '/',
    assetsDir = '_assets',
    autoReload = true,
  } = options
  const assets = new Map<string, string>()

  return {
    configureServer: ({ app, watcher }) => {
      const cache = new Map<string, {mtime: number; data: string}>()

      if (autoReload) {
        watcher.on('change', (e: string) => {
          if (isPSVG(e)) {
            watcher.send({
              type: 'full-reload',
              path: '/',
            })
          }
        })
      }

      app.use(async(koa, next) => {
        if (!isPSVG(koa.path))
          return next()

        try {
          const path = koa.path.slice(1)
          const mtime = +(await stat(path)).mtime
          if (mtime && cache.get(path)?.mtime === mtime) {
            koa.body = cache.get(path)!.data
            console.log(`cache hit ${path}$${mtime}`)
          }
          else {
            const data = compilePSVG(await readFile(path, 'utf-8'))
            cache.set(path, { mtime, data })
            koa.body = data
          }
          koa.type = 'svg'
          koa.status = 200
        }
        catch (e) {
          koa.body = {
            error: e.toString(),
          }
          koa.type = 'json'
          koa.status = 500
        }
      })
    },
    rollupInputOptions: {
      pluginsPostBuild: [
        {
          name: 'vite-plugin-psvg',
          resolveId(id) {
            return isPSVG(id) ? id : null
          },
          async load(id) {
            if (!isPSVG(id))
              return

            const content = compilePSVG(await readFile(id, 'utf-8'))
            const ext = '.svg'
            const baseName = path.basename(id, '.psvg')
            const resolvedFileName = `${baseName}.${hash_sum(id)}${ext}`

            const url = base + slash(path.join(assetsDir, resolvedFileName))

            assets.set(resolvedFileName, content)

            return `export default ${JSON.stringify(url)}`
          },
          generateBundle(_options, bundle) {
            for (const [fileName, source] of assets) {
              bundle[fileName] = {
                name: fileName,
                isAsset: true,
                type: 'asset',
                fileName,
                source,
              }
            }
          },
        },
      ],
    },
  }
}

export default VitePluginPSVG
