<h1 align="center">Color Generate</h1>
<p align="center">
   <a href="https://www.npmjs.com/package/color-generate"><img src="https://img.shields.io/github/license/Johnson-hd/color-generate?color=%231890FF&style=flat-square" alt="License"></a>
  <a href="https://www.npmjs.com/package/color-generate"><img src="https://img.shields.io/badge/node->=14.x-brightgreen.svg" alt="Version"></a>
  <a href="https://github.com/Johnson-hd/color-generate/releases/latest"><img src="https://img.shields.io/github/v/release/Johnson-hd/color-generate" alt="Latest release"></a>
  <a href="https://github.com/Johnson-hd/color-generate"><img src="https://img.shields.io/github/stars/Johnson-hd/color-generate?color=%231890FF&style=flat-square" alt="Stars"></a>
</p>

Referring to [`Ant Design`](https://ant.design/docs/spec/colors-cn), enter a primary color to generate color steps.

<font color=red>Sorry, this library has been suspended for some reason, You can see [Docs](https://color-generate-docs.sh2.agoralab.co) to use it</font>

## Documentation

Docs are available at [`here`](https://color-generate-docs.sh2.agoralab.co)

## Demo

![Demo](https://web-cdn.agora.io/color-generate/static/show-cli.gif)

![Demo](https://web-cdn.agora.io/color-generate/static/show.gif)

## Installation

### CLI

```javascript
# npm
$ sudo npm install color-generate -g

# pnpm
$ pnpm add color-generate -g
```

### YARN | NPM | PNPM

```javascript
yarn add color-generate

npm install color-generate

pnpm add color-generate
```

### CDN

- **`unpkg`**
  - `https://unpkg.com/color-generate/dist/color-generate.umd.js`
  - `https://unpkg.com/color-generate/dist/color-generate.es.js`

- **`jsdelivr`**
  - `https://cdn.jsdelivr.net/npm/color-generate/dist/color-generate.umd.js`
  - `https://cdn.jsdelivr.net/npm/color-generate/dist/color-generate.es.js`

## Examples

### CLI

```bash
# help
$ color-generate -h

# just print color
$ color-generate g -c 099dfd

# generate file Sass/Less
$ color-generate g -c 099dfd -f
```

### Module

```javascript
import { generate } from 'color-generate'
```

### Color Utils

Pure color conversion helpers live in `src/color.ts` and are re-exported from the entry:

```javascript
import {
  hexToRgb, rgbToHex, // hex <-> rgb（支持 3 位缩写、可带 #、大小写混合）
  rgbToHsl, hslToRgb, rgbToHsv, hsvToRgb, // 颜色空间互转
  adjustHue, adjustLightness, // 按色相 / 明度加减得到新色（色相取模、明度截断到 [0, 1]）
  sortByLightness, // 一组颜色按明度从亮到暗排序
  getContrast, pickForeground, // WCAG 对比度 / 从候选里挑对比度最高的前景色
  isValidColor, // 判断字符串是否为合法颜色
} from 'color-generate'
```

### CSS Variables

`generateCssVariables` 把 `generate` 生成的 10 阶色板拼成 less / scss 变量块：

```javascript
import { generate, generateCssVariables } from 'color-generate'

const colors = generate('#099dfd')

generateCssVariables(colors, 'less') // @colorPrimary: #099dfd; ...
generateCssVariables(colors, 'scss') // $colorPrimary: #099dfd; ...
```

### Test

```bash
npm run test # vitest
```

### Broswer

```javascript
<script src="https://cdn.jsdelivr.net/npm/color-generate/dist/color-generate.umd.js"></script>

<script>
  // window mounts the `ColorGenerate`
  console.log("colors", ColorGenerate('#099dfd'));
</script>
```

## Links

- [Documentation](https://color-generate-docs.sh2.agoralab.co/#/)
- [ChangeLog](https://github.com/Johnson-hd/color-generate/blob/master/CHANGELOG.md)
- [Ant Design](https://ant.design/docs/spec/colors-cn)
