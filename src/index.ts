import type { Plugin } from 'vite'
import { createServer } from './dev'
import { Options, ResolvedOptions } from './types'
import { createBuildPlugin } from './build'

export function isPSVG(id: string) {
  return id.endsWith('.psvg')
}

function VitePluginPSVG(options: Options = {}): Plugin {
  const resolved: ResolvedOptions = Object.assign({
    base: '/',
    assetsDir: '_assets',
    autoReload: true,
    minification: true,
  }, options)

  return {
    configureServer: createServer(resolved),
    rollupInputOptions: {
      pluginsPreBuild: [
        createBuildPlugin(resolved),
      ],
    },
  }
}

export default VitePluginPSVG
