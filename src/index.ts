import { readFile } from 'fs/promises'
import type { Plugin } from 'vite'
import { compilePSVG } from '@antfu/psvg'
import path from 'path'
import hash_sum from 'hash-sum'
import slash from 'slash'


export interface Options {
  /**
   * Base public path when served in production.
   * @default '/'
   */
  base?: string
  /**
   * Directory relative from `root` where build output will be placed. If the
   * directory exists, it will be removed before the build.
   * @default 'dist'
   */
  outDir?: string
  /**
   * Directory relative from `outDir` where the built js/css/image assets will
   * be placed.
   * @default '_assets'
   */
  assetsDir?: string
}

function isPSVG(id: string) {
  return id.endsWith('.psvg')
}



function VitePluginPSVG(options: Options = {}): Plugin {
  const {
    base = '/',
    outDir = 'dist',
    assetsDir = '_assets',
  } = options
  const assets = new Map<string, string>()


  return {
    configureServer: ({ app }) => {
      app.use(async(koa, next) => {
        if (!isPSVG(koa.path))
          return next()

        try {
          koa.body = compilePSVG(await readFile(koa.path.slice(1), 'utf-8'))
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
        
            let url = base + slash(path.join(assetsDir, resolvedFileName))

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
                source
              }
            }
          }
        }
      ]
    },
  }
}

export default VitePluginPSVG
