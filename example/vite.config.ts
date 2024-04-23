import type { UserConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import PSVG from '../src/index'

const config: UserConfig = {
  plugins: [
    Vue(),
    PSVG(),
  ],
}

export default config
