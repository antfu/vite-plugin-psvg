export interface Options {
  /**
   * SVG minification, only work for build
   *
   * @default true
   */
  minification?: boolean
}

export type ResolvedOptions = Required<Options>
