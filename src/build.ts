import { readFile } from 'fs/promises'
import path from 'path'
import { compilePSVG } from '@lingdong/psvg'
import hash_sum from 'hash-sum'
import slash from 'slash'
import type { Plugin } from 'rollup'
import SVGO from 'svgo'
import { ResolvedOptions } from './types'
import { isPSVG } from './index'

export function createBuildPlugin({ base, assetsDir, minification }: ResolvedOptions): Plugin {
  const assets = new Map<string, string>()
  const svgo = new SVGO()

  return {
    name: 'vite-plugin-psvg',
    resolveId(id) {
      return isPSVG(id) ? id : null
    },
    async load(id) {
      if (!isPSVG(id))
        return

      const svg = compilePSVG(await readFile(id, 'utf-8'))

      // if (minification)
      //   svg = await svgo.optimize(svg)

      const baseName = path.basename(id, '.psvg')
      const resolvedFileName = `${baseName}.${hash_sum(id)}.svg`

      const url = base + slash(path.join(assetsDir, resolvedFileName))

      assets.set(resolvedFileName, svg)

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
  }
}
