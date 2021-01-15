import type { Plugin } from 'vite'
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

  return createBuildPlugin(resolved)
}

export default VitePluginPSVG
