import { hexToHsv, hsvToHex } from './color';
import { getHue, getSaturation, getValue, topColorCount, behindColorCount } from './core';

export const generate = (primaryColor: string): string[] => {
  const colors: string[] = [];
  const hsv = hexToHsv(primaryColor);

  // 主色前
  for (let i = topColorCount; i > 0; i -= 1) {
    const color = hsvToHex(getHue(hsv, i, true), getSaturation(hsv, i, true), getValue(hsv, i, true));

    colors.push(color);
  }

  // 主色
  colors.push(primaryColor);

  // 主色后
  for (let i = 1; i <= behindColorCount; i += 1) {
    const color = hsvToHex(getHue(hsv, i), getSaturation(hsv, i), getValue(hsv, i));

    colors.push(color);
  }

  return colors;
};

export type CssVariableSyntax = 'less' | 'scss';

/**
 * 把主题色拼成 css 预处理器变量块
 * @param colors generate 生成的 10 阶色板
 * @param syntax less 用 @ 前缀，scss 用 $ 前缀
 * @returns 变量定义文本
 */
export const generateCssVariables = (colors: string[], syntax: CssVariableSyntax = 'less'): string => {
  const prefix = syntax === 'scss' ? '$' : '@';
  const lines = colors.map((color, index) => {
    const name = index === topColorCount ? 'colorPrimary' : `colorPrimary-${index < topColorCount ? index + 1 : index}`;

    return `${prefix}${name}: ${color};`;
  });

  // 主色变量提到最前，与 templates 里的变量块保持一致
  const primary = lines.splice(topColorCount, 1)[0];

  return ['/* Primary Color */', primary, ...lines, ''].join('\n');
};
