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

const HEX_SHORT_REG = /^#?([0-9a-f]{3})$/i;
const HEX_FULL_REG = /^#?([0-9a-f]{6})$/i;
const RGB_REG = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(?:0|1|0?\.\d+)\s*)?\)$/i;
const HSL_REG = /^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*(?:,\s*(?:0|1|0?\.\d+)\s*)?\)$/i;

const clamp = (num: number, min: number, max: number): number => Math.min(max, Math.max(min, num));

/**
 * 色相取模到 [0, 360)
 */
const normalizeHue = (hue: number): number => ((hue % 360) + 360) % 360;

/**
 * 规范化十六进制色值，支持三位缩写、可选井号与大小写混合
 * @param hex 十六进制字符串
 * @returns 小写六位带井号的色值，非法输入返回 null
 */
export const normalizeHex = (hex: string): string | null => {
  if (typeof hex !== 'string') {
    return null;
  }

  const value = hex.trim();
  const shortMatch = value.match(HEX_SHORT_REG);

  if (shortMatch) {
    const hexValue = shortMatch[1];
    return `#${hexValue[0]}${hexValue[0]}${hexValue[1]}${hexValue[1]}${hexValue[2]}${hexValue[2]}`.toLowerCase();
  }

  const fullMatch = value.match(HEX_FULL_REG);

  if (fullMatch) {
    return `#${fullMatch[1]}`.toLowerCase();
  }

  return null;
};

/**
 * 十六进制转 rgb
 */
export const hexToRgb = (hex: string): RGB | null => {
  const normalized = normalizeHex(hex);

  if (!normalized) {
    return null;
  }

  const num = parseInt(normalized.slice(1), 16);

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
};

/**
 * rgb 转十六进制，通道先四舍五入再截断到 [0, 255]
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (channel: number): string => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * rgb 转 hsl，h ∈ [0, 360)，s、l ∈ [0, 1]
 */
export const rgbToHsl = (r: number, g: number, b: number): HSL => {
  const red = clamp(r, 0, 255) / 255;
  const green = clamp(g, 0, 255) / 255;
  const blue = clamp(b, 0, 255) / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: lightness };
  }

  const delta = max - min;
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let hue: number;

  if (max === red) {
    hue = ((green - blue) / delta + (green < blue ? 6 : 0)) * 60;
  } else if (max === green) {
    hue = ((blue - red) / delta + 2) * 60;
  } else {
    hue = ((red - green) / delta + 4) * 60;
  }

  return { h: hue, s: saturation, l: lightness };
};

/**
 * hsl 转 rgb，色相先取模，避免 360 度以外溢出
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

  const hueToRgb = (t: number): number => {
    let value = t;

    if (value < 0) value += 1;
    if (value > 1) value -= 1;
    if (value < 1 / 6) return p + (q - p) * 6 * value;
    if (value < 1 / 2) return q;
    if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6;

    return p;
  };

  return {
    r: Math.round(hueToRgb(hue + 1 / 3) * 255),
    g: Math.round(hueToRgb(hue) * 255),
    b: Math.round(hueToRgb(hue - 1 / 3) * 255),
  };
};

/**
 * 十六进制转 hsl
 */
export const hexToHsl = (hex: string): HSL | null => {
  const rgb = hexToRgb(hex);

  if (!rgb) {
    return null;
  }

  return rgbToHsl(rgb.r, rgb.g, rgb.b);
};

/**
 * hsl 转十六进制
 */
export const hslToHex = (h: number, s: number, l: number): string => {
  const rgb = hslToRgb(h, s, l);

  return rgbToHex(rgb.r, rgb.g, rgb.b);
};

/**
 * rgb 转 hsv，h ∈ [0, 360)，s、v ∈ [0, 1]
 */
export const rgbToHsv = (r: number, g: number, b: number): HSV => {
  const red = clamp(r, 0, 255) / 255;
  const green = clamp(g, 0, 255) / 255;
  const blue = clamp(b, 0, 255) / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let hue = 0;

  if (delta !== 0) {
    if (max === red) {
      hue = ((green - blue) / delta + (green < blue ? 6 : 0)) * 60;
    } else if (max === green) {
      hue = ((blue - red) / delta + 2) * 60;
    } else {
      hue = ((red - green) / delta + 4) * 60;
    }
  }

  return {
    h: hue,
    s: max === 0 ? 0 : delta / max,
    v: max,
  };
};

/**
 * hsv 转 rgb，色相先取模
 */
export const hsvToRgb = (h: number, s: number, v: number): RGB => {
  const hue = normalizeHue(h);
  const saturation = clamp(s, 0, 1);
  const value = clamp(v, 0, 1);

  const c = value * saturation;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = value - c;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (hue < 60) {
    red = c;
    green = x;
  } else if (hue < 120) {
    red = x;
    green = c;
  } else if (hue < 180) {
    green = c;
    blue = x;
  } else if (hue < 240) {
    green = x;
    blue = c;
  } else if (hue < 300) {
    red = x;
    blue = c;
  } else {
    red = c;
    blue = x;
  }

  return {
    r: Math.round((red + m) * 255),
    g: Math.round((green + m) * 255),
    b: Math.round((blue + m) * 255),
  };
};

/**
 * 十六进制转 hsv
 */
export const hexToHsv = (hex: string): HSV | null => {
  const rgb = hexToRgb(hex);

  if (!rgb) {
    return null;
  }

  return rgbToHsv(rgb.r, rgb.g, rgb.b);
};

/**
 * hsv 转十六进制
 */
export const hsvToHex = (h: number, s: number, v: number): string => {
  const rgb = hsvToRgb(h, s, v);

  return rgbToHex(rgb.r, rgb.g, rgb.b);
};

/**
 * 解析颜色字符串，支持十六进制（三位/六位/可选井号）、rgb()、hsl()
 */
export const parseColor = (input: string): RGB | null => {
  if (typeof input !== 'string') {
    return null;
  }

  const value = input.trim();

  const hexRgb = hexToRgb(value);

  if (hexRgb) {
    return hexRgb;
  }

  const rgbMatch = value.match(RGB_REG);

  if (rgbMatch) {
    const r = Number(rgbMatch[1]);
    const g = Number(rgbMatch[2]);
    const b = Number(rgbMatch[3]);

    if (r <= 255 && g <= 255 && b <= 255) {
      return { r, g, b };
    }

    return null;
  }

  const hslMatch = value.match(HSL_REG);

  if (hslMatch) {
    return hslToRgb(Number(hslMatch[1]), Number(hslMatch[2]) / 100, Number(hslMatch[3]) / 100);
  }

  return null;
};

/**
 * 判断一段字符串是否为合法颜色
 */
export const isValidColor = (input: string): boolean => parseColor(input) !== null;

/**
 * 按色相加减得到新色，色相取模到 [0, 360)
 */
export const adjustHue = (color: string, amount: number): string => {
  const rgb = parseColor(color);

  if (!rgb) {
    return color;
  }

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  return hslToHex(hsl.h + amount, hsl.s, hsl.l);
};

/**
 * 按明度加减得到新色，明度截断到 [0, 1]，小基数不会被截成零
 */
export const adjustLightness = (color: string, amount: number): string => {
  const rgb = parseColor(color);

  if (!rgb) {
    return color;
  }

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const lightness = clamp(hsl.l + amount, 0, 1);

  return hslToHex(hsl.h, hsl.s, lightness);
};

/**
 * 获取颜色明度（hsl 的 l），非法颜色返回 0
 */
export const getLightness = (color: string): number => {
  const rgb = parseColor(color);

  if (!rgb) {
    return 0;
  }

  return rgbToHsl(rgb.r, rgb.g, rgb.b).l;
};

/**
 * 把一组颜色按明度从亮到暗排序，不改动原数组
 */
export const sortByLightness = (colors: string[]): string[] =>
  colors.slice().sort((prev, next) => getLightness(next) - getLightness(prev));

/**
 * 获取相对亮度（WCAG）
 */
export const getLuminance = (color: string): number => {
  const rgb = parseColor(color);

  if (!rgb) {
    return 0;
  }

  const transform = (channel: number): number => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * transform(rgb.r) + 0.7152 * transform(rgb.g) + 0.0722 * transform(rgb.b);
};

/**
 * 两个颜色的对比度（WCAG），取值 [1, 21]
 */
export const getContrast = (color1: string, color2: string): number => {
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);
  const light = Math.max(luminance1, luminance2);
  const dark = Math.min(luminance1, luminance2);

  return Number(((light + 0.05) / (dark + 0.05)).toFixed(2));
};

/**
 * 从候选色里挑与背景对比度最高的那个当前景色
 */
export const pickContrastColor = (background: string, candidates: string[] = ['#000000', '#ffffff']): string => {
  let best = candidates[0] || '#000000';
  let bestContrast = 0;

  candidates.forEach((candidate) => {
    const contrast = getContrast(background, candidate);

    if (contrast > bestContrast) {
      best = candidate;
      bestContrast = contrast;
    }
  });

  return best;
};
