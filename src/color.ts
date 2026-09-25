export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface HSV {
  h: number;
  s: number;
  v: number;
}

const HEX_PATTERN = /^#?(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const RGB_PATTERN = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(?:0|1|0?\.\d+)\s*)?\)$/;

const clamp = (num: number, min: number, max: number): number => Math.min(max, Math.max(min, num));

/**
 * 色相归一化到 [0, 360)
 */
export const normalizeHue = (hue: number): number => ((hue % 360) + 360) % 360;

/**
 * 判断一段字符串是否为合法颜色（3/6 位十六进制，可带 #，或 rgb()/rgba()）
 */
export const isValidColor = (color: string): boolean => {
  if (typeof color !== 'string') {
    return false;
  }

  const input = color.trim();

  if (HEX_PATTERN.test(input)) {
    return true;
  }

  const rgbMatch = input.match(RGB_PATTERN);

  return !!rgbMatch && [rgbMatch[1], rgbMatch[2], rgbMatch[3]].every((channel) => Number(channel) <= 255);
};

/**
 * 十六进制转 rgb，支持 3 位缩写、可带 #、大小写混合
 */
export const hexToRgb = (hex: string): RGB | null => {
  if (typeof hex !== 'string') {
    return null;
  }

  let input = hex.trim().replace(/^#/, '');

  if (/^[0-9a-fA-F]{3}$/.test(input)) {
    input = input
      .split('')
      .map((char) => char + char)
      .join('');
  }

  if (!/^[0-9a-fA-F]{6}$/.test(input)) {
    return null;
  }

  const value = parseInt(input, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

/**
 * rgb 转十六进制
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (channel: number): string => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * rgb 转 hsl，h ∈ [0, 360)，s/l ∈ [0, 1]
 */
export const rgbToHsl = (r: number, g: number, b: number): HSL => {
  const rn = clamp(r, 0, 255) / 255;
  const gn = clamp(g, 0, 255) / 255;
  const bn = clamp(b, 0, 255) / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l };
  }

  const delta = max - min;
  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let h: number;
  switch (max) {
    case rn:
      h = ((gn - bn) / delta + (gn < bn ? 6 : 0)) * 60;
      break;
    case gn:
      h = ((bn - rn) / delta + 2) * 60;
      break;
    default:
      h = ((rn - gn) / delta + 4) * 60;
      break;
  }

  return { h, s, l };
};

/**
 * hsl 转 rgb
 */
export const hslToRgb = (h: number, s: number, l: number): RGB => {
  const hue = normalizeHue(h) / 360;
  const saturation = clamp(s, 0, 1);
  const lightness = clamp(l, 0, 1);

  if (saturation === 0) {
    const gray = Math.round(lightness * 255);
    return { r: gray, g: gray, b: gray };
  }

  const q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;

  const hueToChannel = (t: number): number => {
    let tn = t;
    if (tn < 0) tn += 1;
    if (tn > 1) tn -= 1;
    if (tn < 1 / 6) return p + (q - p) * 6 * tn;
    if (tn < 1 / 2) return q;
    if (tn < 2 / 3) return p + (q - p) * (2 / 3 - tn) * 6;
    return p;
  };

  return {
    r: Math.round(hueToChannel(hue + 1 / 3) * 255),
    g: Math.round(hueToChannel(hue) * 255),
    b: Math.round(hueToChannel(hue - 1 / 3) * 255),
  };
};

/**
 * rgb 转 hsv，h ∈ [0, 360)，s/v ∈ [0, 1]
 */
export const rgbToHsv = (r: number, g: number, b: number): HSV => {
  const rn = clamp(r, 0, 255) / 255;
  const gn = clamp(g, 0, 255) / 255;
  const bn = clamp(b, 0, 255) / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    switch (max) {
      case rn:
        h = ((gn - bn) / delta + (gn < bn ? 6 : 0)) * 60;
        break;
      case gn:
        h = ((bn - rn) / delta + 2) * 60;
        break;
      default:
        h = ((rn - gn) / delta + 4) * 60;
        break;
    }
  }

  return {
    h,
    s: max === 0 ? 0 : delta / max,
    v: max,
  };
};

/**
 * hsv 转 rgb
 */
export const hsvToRgb = (h: number, s: number, v: number): RGB => {
  const hue = normalizeHue(h);
  const saturation = clamp(s, 0, 1);
  const value = clamp(v, 0, 1);

  const c = value * saturation;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = value - c;

  let rn = 0;
  let gn = 0;
  let bn = 0;

  if (hue < 60) {
    rn = c;
    gn = x;
  } else if (hue < 120) {
    rn = x;
    gn = c;
  } else if (hue < 180) {
    gn = c;
    bn = x;
  } else if (hue < 240) {
    gn = x;
    bn = c;
  } else if (hue < 300) {
    rn = x;
    bn = c;
  } else {
    rn = c;
    bn = x;
  }

  return {
    r: Math.round((rn + m) * 255),
    g: Math.round((gn + m) * 255),
    b: Math.round((bn + m) * 255),
  };
};

export const hexToHsl = (hex: string): HSL => {
  const rgb = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
};

export const hslToHex = (h: number, s: number, l: number): string => {
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
};

export const hexToHsv = (hex: string): HSV => {
  const rgb = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
};

export const hsvToHex = (h: number, s: number, v: number): string => {
  const rgb = hsvToRgb(h, s, v);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
};

/**
 * 按色相加减得到新色，色相取模到 [0, 360)
 */
export const adjustHue = (color: string, amount: number): string => {
  const hsl = hexToHsl(color);
  return hslToHex(hsl.h + amount, hsl.s, hsl.l);
};

/**
 * 按明度加减得到新色，明度截断到 [0, 1]，小基数不会被截成 0
 */
export const adjustLightness = (color: string, amount: number): string => {
  const hsl = hexToHsl(color);
  const lightness = clamp(hsl.l + amount, 0, 1);
  return hslToHex(hsl.h, hsl.s, lightness);
};

/**
 * 获取颜色明度，∈ [0, 1]
 */
export const getLightness = (color: string): number => hexToHsl(color).l;

/**
 * 把一组颜色按明度从亮到暗排序
 */
export const sortByLightness = (colors: string[]): string[] =>
  [...colors].sort((prev, next) => getLightness(next) - getLightness(prev));

const channelToLinear = (channel: number): number => {
  const c = clamp(channel, 0, 255) / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

/**
 * WCAG 相对亮度，∈ [0, 1]
 */
export const getLuminance = (color: string): number => {
  const rgb = hexToRgb(color) ?? { r: 0, g: 0, b: 0 };
  return 0.2126 * channelToLinear(rgb.r) + 0.7152 * channelToLinear(rgb.g) + 0.0722 * channelToLinear(rgb.b);
};

/**
 * 两个颜色的 WCAG 对比度，∈ [1, 21]
 */
export const getContrast = (color1: string, color2: string): number => {
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
};

/**
 * 从候选色里挑与背景对比度最高的那个当前景色
 */
export const pickForeground = (background: string, candidates: string[]): string => {
  let foreground = candidates[0];
  let maxContrast = 0;

  for (const candidate of candidates) {
    const contrast = getContrast(background, candidate);
    if (contrast > maxContrast) {
      maxContrast = contrast;
      foreground = candidate;
    }
  }

  return foreground;
};
