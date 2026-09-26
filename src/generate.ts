import { getHue, getSaturation, getValue, topColorCount, behindColorCount } from './core';
import { parseColor, rgbToHsv, hsvToHex } from './color';

export const generate = (primaryColor: string): string[] => {
  const colors = [];
  const rgb = parseColor(primaryColor);
  const hsv = rgb ? rgbToHsv(rgb.r, rgb.g, rgb.b) : { h: 0, s: 0, v: 0 };

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

export type CssVariableLang = 'less' | 'scss';

const functionColorMap: Record<string, string> = {
  colorSuccess: '#67c23a',
  colorWarning: '#e6a23c',
  colorDanger: '#f56c6c',
  colorInfo: '#909399',
};

/**
 * 把主题色拼成 css 预处理器变量块
 * @param colors generate 生成的 10 级色板
 * @param lang less 使用 @ 前缀，scss 使用 $ 前缀
 * @returns 变量块文本
 */
export const generateCssVariables = (colors: string[], lang: CssVariableLang = 'less'): string => {
  const prefix = lang === 'scss' ? '$' : '@';
  const lines: string[] = ['/* Primary Color */'];

  lines.push(`${prefix}colorPrimary: ${colors[5]};`);

  for (let i = 0; i < 9; i += 1) {
    const colorIndex = i < 5 ? i : i + 1;
    lines.push(`${prefix}colorPrimary-${i + 1}: ${colors[colorIndex]};`);
  }

  lines.push('', '/* Function Color */');

  Object.keys(functionColorMap).forEach((name) => {
    lines.push(`${prefix}${name}: ${functionColorMap[name]};`);
  });

  return lines.join('\n');
};
