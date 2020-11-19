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
   * @default true
   */
  autoReload?: boolean

  /**
   * SVG minification, only work for build
   *
   * @default true
   */
  minification?: boolean
}

export type ResolvedOptions = Required<Options>
