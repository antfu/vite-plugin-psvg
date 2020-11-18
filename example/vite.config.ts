import { UserConfig } from 'vite'
import PSVG from 'vite-plugin-psvg'

const config: UserConfig = {
  plugins: [
    PSVG(),
  ],
}

export default config
