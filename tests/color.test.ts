import { describe, it, expect } from 'vitest';

import {
  normalizeHex,
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,
  hslToRgb,
  adjustHue,
  adjustLightness,
  sortByLightness,
  getContrast,
  pickContrastColor,
  isValidColor,
} from '../src/color';

describe('hex 与 rgb 互转', () => {
  it('十六进制转 rgb', () => {
    expect(hexToRgb('#099dfd')).toEqual({ r: 9, g: 157, b: 253 });
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('rgb 转十六进制', () => {
    expect(rgbToHex(9, 157, 253)).toBe('#099dfd');
    expect(rgbToHex(0, 0, 0)).toBe('#000000');
    expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
  });

  it('hex -> rgb -> hex 往返一致', () => {
    const hex = '#67c23a';
    const rgb = hexToRgb(hex);

    expect(rgb).not.toBeNull();
    expect(rgbToHex(rgb!.r, rgb!.g, rgb!.b)).toBe(hex);
  });

  it('rgb -> hsl -> hex 往返一致', () => {
    expect(hslToHex(204, 0.98, 0.51)).toBe('#089bfd');
    expect(hexToHsl('#ff0000')).toEqual({ h: 0, s: 1, l: 0.5 });
  });
});

describe('三位缩写与井号大小写', () => {
  it('三位缩写展开为六位', () => {
    expect(normalizeHex('#abc')).toBe('#aabbcc');
    expect(hexToRgb('#abc')).toEqual({ r: 170, g: 187, b: 204 });
  });

  it('不带井号也能识别', () => {
    expect(normalizeHex('099dfd')).toBe('#099dfd');
    expect(normalizeHex('abc')).toBe('#aabbcc');
  });

  it('大小写混合统一为小写', () => {
    expect(normalizeHex('#AaBbCc')).toBe('#aabbcc');
    expect(normalizeHex('#ABC')).toBe('#aabbcc');
  });

  it('非法输入返回 null 且校验不通过', () => {
    expect(normalizeHex('#abcd')).toBeNull();
    expect(normalizeHex('#gggggg')).toBeNull();
    expect(normalizeHex('red')).toBeNull();
    expect(isValidColor('#abc')).toBe(true);
    expect(isValidColor('#aAbBcC')).toBe(true);
    expect(isValidColor('rgb(9, 157, 253)')).toBe(true);
    expect(isValidColor('hsl(204, 98%, 51%)')).toBe(true);
    expect(isValidColor('#abcd')).toBe(false);
    expect(isValidColor('hello')).toBe(false);
  });
});

describe('色相加减取模', () => {
  it('350 度加 30 度回到 20 度', () => {
    const base = hslToHex(350, 1, 0.5);
    const result = hexToHsl(adjustHue(base, 30));

    expect(Math.round(result!.h)).toBe(20);
  });

  it('10 度减 30 度回到 340 度', () => {
    const base = hslToHex(10, 1, 0.5);
    const result = hexToHsl(adjustHue(base, -30));

    expect(Math.round(result!.h)).toBe(340);
  });

  it('hslToRgb 对超界色相取模，不会溢出', () => {
    expect(hslToRgb(380, 1, 0.5)).toEqual(hslToRgb(20, 1, 0.5));
    expect(hslToRgb(-30, 1, 0.5)).toEqual(hslToRgb(330, 1, 0.5));
  });
});

describe('明度贴边截断', () => {
  it('小基数加小明度不会被截成零', () => {
    expect(adjustLightness('#000000', 0.01)).toBe('#030303');
    expect(adjustLightness('#000000', 0.01)).not.toBe('#000000');
  });

  it('超过边界时截断到黑白', () => {
    expect(adjustLightness('#ffffff', 0.5)).toBe('#ffffff');
    expect(adjustLightness('#000000', -0.5)).toBe('#000000');
  });

  it('按明度从亮到暗排序', () => {
    expect(sortByLightness(['#000000', '#ffffff', '#808080'])).toEqual(['#ffffff', '#808080', '#000000']);
  });
});

describe('对比度', () => {
  it('黑白两端取得极值', () => {
    expect(getContrast('#000000', '#ffffff')).toBe(21);
    expect(getContrast('#ffffff', '#000000')).toBe(21);
    expect(getContrast('#000000', '#000000')).toBe(1);
    expect(getContrast('#ffffff', '#ffffff')).toBe(1);
  });

  it('从候选里挑对比度最高的前景色', () => {
    expect(pickContrastColor('#000000', ['#ffffff', '#000000'])).toBe('#ffffff');
    expect(pickContrastColor('#ffffff', ['#ffffff', '#000000'])).toBe('#000000');
    expect(pickContrastColor('#099dfd')).toBe('#000000');
  });
});
