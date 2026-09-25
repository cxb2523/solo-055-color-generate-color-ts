import { describe, expect, it } from 'vitest';

import {
  adjustHue,
  adjustLightness,
  getContrast,
  getLightness,
  hexToHsl,
  hexToRgb,
  hslToHex,
  isValidColor,
  normalizeHue,
  pickForeground,
  rgbToHex,
  sortByLightness,
} from '../src/color';
import { generate, generateCssVariables } from '../src/generate';

describe('hexToRgb / rgbToHex', () => {
  it('十六进制与 rgb 往返转换', () => {
    const cases = ['#099dfd', '#000000', '#ffffff', '#a1b2c3', '#ff5500'];

    for (const hex of cases) {
      const rgb = hexToRgb(hex);

      expect(rgb).not.toBeNull();
      expect(rgbToHex(rgb!.r, rgb!.g, rgb!.b)).toBe(hex);
    }
  });

  it('解析六位十六进制', () => {
    expect(hexToRgb('#099dfd')).toEqual({ r: 9, g: 157, b: 253 });
  });

  it('支持三位缩写、省略井号与大小写混合', () => {
    const expected = { r: 170, g: 187, b: 204 };

    expect(hexToRgb('#abc')).toEqual(expected);
    expect(hexToRgb('abc')).toEqual(expected);
    expect(hexToRgb('#ABC')).toEqual(expected);
    expect(hexToRgb('aBc')).toEqual(expected);
    expect(hexToRgb('#AaBbCc')).toEqual(expected);
    expect(rgbToHex(170, 187, 204)).toBe('#aabbcc');
  });

  it('非法输入返回 null', () => {
    expect(hexToRgb('#12')).toBeNull();
    expect(hexToRgb('#12345')).toBeNull();
    expect(hexToRgb('zzzzzz')).toBeNull();
    expect(hexToRgb('')).toBeNull();
  });
});

describe('isValidColor', () => {
  it('接受三位/六位、可带井号、大小写混合', () => {
    expect(isValidColor('#abc')).toBe(true);
    expect(isValidColor('abc')).toBe(true);
    expect(isValidColor('#ABCDEF')).toBe(true);
    expect(isValidColor('099dfd')).toBe(true);
    expect(isValidColor('#aBcDeF')).toBe(true);
  });

  it('拒绝非法字符串', () => {
    expect(isValidColor('#abcd')).toBe(false);
    expect(isValidColor('#12345')).toBe(false);
    expect(isValidColor('red')).toBe(false);
    expect(isValidColor('')).toBe(false);
  });
});

describe('normalizeHue / adjustHue', () => {
  it('色相加减取模到 [0, 360)', () => {
    expect(normalizeHue(380)).toBe(20);
    expect(normalizeHue(350 + 30)).toBe(20);
    expect(normalizeHue(-30)).toBe(330);
    expect(normalizeHue(720)).toBe(0);
  });

  it('hslToHex 对超界色相取模', () => {
    expect(hslToHex(380, 1, 0.5)).toBe(hslToHex(20, 1, 0.5));
    expect(hslToHex(-340, 1, 0.5)).toBe(hslToHex(20, 1, 0.5));
  });

  it('adjustHue 跨过 360 边界不溢出', () => {
    const shifted = adjustHue(hslToHex(350, 1, 0.5), 30);

    expect(hexToHsl(shifted).h).toBeCloseTo(20, 0);
  });

  it('adjustHue 跨过 0 边界', () => {
    const shifted = adjustHue(hslToHex(10, 1, 0.5), -30);

    expect(hexToHsl(shifted).h).toBeCloseTo(340, 0);
  });
});

describe('adjustLightness', () => {
  it('明度贴边截断到 [0, 1]', () => {
    expect(adjustLightness('#000000', -0.5)).toBe('#000000');
    expect(adjustLightness('#ffffff', 0.5)).toBe('#ffffff');
    expect(adjustLightness('#808080', 1)).toBe('#ffffff');
    expect(adjustLightness('#808080', -1)).toBe('#000000');
  });

  it('小基数明度不会被截成零', () => {
    const result = adjustLightness('#010203', 0.001);

    expect(result).not.toBe('#000000');
    expect(getLightness(result)).toBeGreaterThan(0);
  });
});

describe('getContrast', () => {
  it('黑白两端取极值', () => {
    expect(getContrast('#000000', '#ffffff')).toBe(21);
    expect(getContrast('#ffffff', '#000000')).toBe(21);
    expect(getContrast('#000000', '#000000')).toBe(1);
    expect(getContrast('#ffffff', '#ffffff')).toBe(1);
  });

  it('对比度对称且落在 [1, 21]', () => {
    const contrast = getContrast('#099dfd', '#ffffff');

    expect(contrast).toBe(getContrast('#ffffff', '#099dfd'));
    expect(contrast).toBeGreaterThanOrEqual(1);
    expect(contrast).toBeLessThanOrEqual(21);
  });
});

describe('sortByLightness / pickForeground', () => {
  it('按明度从亮到暗排序', () => {
    expect(sortByLightness(['#000000', '#ffffff', '#808080'])).toEqual(['#ffffff', '#808080', '#000000']);
  });

  it('从候选里挑对比度最高的前景色', () => {
    expect(pickForeground('#000000', ['#000000', '#ffffff'])).toBe('#ffffff');
    expect(pickForeground('#ffffff', ['#ffffff', '#000000'])).toBe('#000000');
  });
});

describe('generate / generateCssVariables', () => {
  it('生成 10 阶色板且主色在第 6 位', () => {
    const colors = generate('#099dfd');

    expect(colors).toHaveLength(10);
    expect(colors[5]).toBe('#099dfd');
    colors.forEach((color) => expect(isValidColor(color)).toBe(true));
  });

  it('拼出 less 变量块', () => {
    const colors = generate('#099dfd');
    const less = generateCssVariables(colors, 'less');

    expect(less).toContain('@colorPrimary: #099dfd;');
    expect(less).toContain(`@colorPrimary-1: ${colors[0]};`);
    expect(less).toContain(`@colorPrimary-9: ${colors[9]};`);
  });

  it('拼出 scss 变量块', () => {
    const colors = generate('#099dfd');
    const scss = generateCssVariables(colors, 'scss');

    expect(scss).toContain('$colorPrimary: #099dfd;');
    expect(scss).toContain(`$colorPrimary-1: ${colors[0]};`);
    expect(scss).toContain(`$colorPrimary-9: ${colors[9]};`);
  });
});
