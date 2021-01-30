import { UserConfig } from 'vite'
import PSVG from 'vite-plugin-psvg'
import Vue from '@vitejs/plugin-vue'

const config: UserConfig = {
  plugins: [
    Vue(),
    PSVG(),
  ],
}

export default config
