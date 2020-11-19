import { promises as fs } from 'fs'
import { compilePSVG } from '@lingdong/psvg'
import { ServerPlugin } from 'vite'
import { ResolvedOptions } from './types'
import { isPSVG } from './index'

export function createServer({ autoReload }: ResolvedOptions): ServerPlugin {
  return ({ app, watcher }) => {
    const cache = new Map<string, { mtime: number; data: string }>()

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
        const mtime = +(await fs.stat(path)).mtime
        if (mtime && cache.get(path)?.mtime === mtime) {
          koa.body = cache.get(path)!.data
          // console.log(`cache hit ${path} - ${mtime}`)
        }
        else {
          const data = compilePSVG(await fs.readFile(path, 'utf-8'))
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
  }
}
