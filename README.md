<p align='center'><img src='./assets/vite.svg'></p>

# PSVG Vite Plugin 

[PSVG - Programmable SVG](https://github.com/LingDong-/psvg) for [Vite](https://github.com/vitejs/vite)

## Install

Install

```bash
npm i vite-plugin-psvg -D # yarn add vite-plugin-psvg -D
```

Add it to `vite.config.js`

```ts
// vite.config.js
import PSVG from 'vite-plugin-psvg'

export default {
  plugins: [
    PSVG()
  ],
};
```

Then use it as normal SVGs or images.

```html
<img src='./hello.psvg'>
```

## Example

See the [/example](./example).

## License

MIT License © 2020 [Anthony Fu](https://github.com/antfu)
