"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickContrastColor = exports.getContrast = exports.getLuminance = exports.sortByLightness = exports.getLightness = exports.adjustLightness = exports.adjustHue = exports.isValidColor = exports.parseColor = exports.hsvToHex = exports.hexToHsv = exports.hsvToRgb = exports.rgbToHsv = exports.hslToHex = exports.hexToHsl = exports.hslToRgb = exports.rgbToHsl = exports.rgbToHex = exports.hexToRgb = exports.normalizeHex = void 0;
var HEX_SHORT_REG = /^#?([0-9a-f]{3})$/i;
var HEX_FULL_REG = /^#?([0-9a-f]{6})$/i;
var RGB_REG = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(?:0|1|0?\.\d+)\s*)?\)$/i;
var HSL_REG = /^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*(?:,\s*(?:0|1|0?\.\d+)\s*)?\)$/i;
var clamp = function (num, min, max) { return Math.min(max, Math.max(min, num)); };
/**
 * 色相取模到 [0, 360)
 */
var normalizeHue = function (hue) { return ((hue % 360) + 360) % 360; };
/**
 * 规范化十六进制色值，支持三位缩写、可选井号与大小写混合
 * @param hex 十六进制字符串
 * @returns 小写六位带井号的色值，非法输入返回 null
 */
var normalizeHex = function (hex) {
    if (typeof hex !== 'string') {
        return null;
    }
    var value = hex.trim();
    var shortMatch = value.match(HEX_SHORT_REG);
    if (shortMatch) {
        var hexValue = shortMatch[1];
        return "#".concat(hexValue[0]).concat(hexValue[0]).concat(hexValue[1]).concat(hexValue[1]).concat(hexValue[2]).concat(hexValue[2]).toLowerCase();
    }
    var fullMatch = value.match(HEX_FULL_REG);
    if (fullMatch) {
        return "#".concat(fullMatch[1]).toLowerCase();
    }
    return null;
};
exports.normalizeHex = normalizeHex;
/**
 * 十六进制转 rgb
 */
var hexToRgb = function (hex) {
    var normalized = (0, exports.normalizeHex)(hex);
    if (!normalized) {
        return null;
    }
    var num = parseInt(normalized.slice(1), 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
    };
};
exports.hexToRgb = hexToRgb;
/**
 * rgb 转十六进制，通道先四舍五入再截断到 [0, 255]
 */
var rgbToHex = function (r, g, b) {
    var toHex = function (channel) { return clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0'); };
    return "#".concat(toHex(r)).concat(toHex(g)).concat(toHex(b));
};
exports.rgbToHex = rgbToHex;
/**
 * rgb 转 hsl，h ∈ [0, 360)，s、l ∈ [0, 1]
 */
var rgbToHsl = function (r, g, b) {
    var red = clamp(r, 0, 255) / 255;
    var green = clamp(g, 0, 255) / 255;
    var blue = clamp(b, 0, 255) / 255;
    var max = Math.max(red, green, blue);
    var min = Math.min(red, green, blue);
    var lightness = (max + min) / 2;
    if (max === min) {
        return { h: 0, s: 0, l: lightness };
    }
    var delta = max - min;
    var saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    var hue;
    if (max === red) {
        hue = ((green - blue) / delta + (green < blue ? 6 : 0)) * 60;
    }
    else if (max === green) {
        hue = ((blue - red) / delta + 2) * 60;
    }
    else {
        hue = ((red - green) / delta + 4) * 60;
    }
    return { h: hue, s: saturation, l: lightness };
};
exports.rgbToHsl = rgbToHsl;
/**
 * hsl 转 rgb，色相先取模，避免 360 度以外溢出
 */
var hslToRgb = function (h, s, l) {
    var hue = normalizeHue(h) / 360;
    var saturation = clamp(s, 0, 1);
    var lightness = clamp(l, 0, 1);
    if (saturation === 0) {
        var gray = Math.round(lightness * 255);
        return { r: gray, g: gray, b: gray };
    }
    var q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
    var p = 2 * lightness - q;
    var hueToRgb = function (t) {
        var value = t;
        if (value < 0)
            value += 1;
        if (value > 1)
            value -= 1;
        if (value < 1 / 6)
            return p + (q - p) * 6 * value;
        if (value < 1 / 2)
            return q;
        if (value < 2 / 3)
            return p + (q - p) * (2 / 3 - value) * 6;
        return p;
    };
    return {
        r: Math.round(hueToRgb(hue + 1 / 3) * 255),
        g: Math.round(hueToRgb(hue) * 255),
        b: Math.round(hueToRgb(hue - 1 / 3) * 255),
    };
};
exports.hslToRgb = hslToRgb;
/**
 * 十六进制转 hsl
 */
var hexToHsl = function (hex) {
    var rgb = (0, exports.hexToRgb)(hex);
    if (!rgb) {
        return null;
    }
    return (0, exports.rgbToHsl)(rgb.r, rgb.g, rgb.b);
};
exports.hexToHsl = hexToHsl;
/**
 * hsl 转十六进制
 */
var hslToHex = function (h, s, l) {
    var rgb = (0, exports.hslToRgb)(h, s, l);
    return (0, exports.rgbToHex)(rgb.r, rgb.g, rgb.b);
};
exports.hslToHex = hslToHex;
/**
 * rgb 转 hsv，h ∈ [0, 360)，s、v ∈ [0, 1]
 */
var rgbToHsv = function (r, g, b) {
    var red = clamp(r, 0, 255) / 255;
    var green = clamp(g, 0, 255) / 255;
    var blue = clamp(b, 0, 255) / 255;
    var max = Math.max(red, green, blue);
    var min = Math.min(red, green, blue);
    var delta = max - min;
    var hue = 0;
    if (delta !== 0) {
        if (max === red) {
            hue = ((green - blue) / delta + (green < blue ? 6 : 0)) * 60;
        }
        else if (max === green) {
            hue = ((blue - red) / delta + 2) * 60;
        }
        else {
            hue = ((red - green) / delta + 4) * 60;
        }
    }
    return {
        h: hue,
        s: max === 0 ? 0 : delta / max,
        v: max,
    };
};
exports.rgbToHsv = rgbToHsv;
/**
 * hsv 转 rgb，色相先取模
 */
var hsvToRgb = function (h, s, v) {
    var hue = normalizeHue(h);
    var saturation = clamp(s, 0, 1);
    var value = clamp(v, 0, 1);
    var c = value * saturation;
    var x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    var m = value - c;
    var red = 0;
    var green = 0;
    var blue = 0;
    if (hue < 60) {
        red = c;
        green = x;
    }
    else if (hue < 120) {
        red = x;
        green = c;
    }
    else if (hue < 180) {
        green = c;
        blue = x;
    }
    else if (hue < 240) {
        green = x;
        blue = c;
    }
    else if (hue < 300) {
        red = x;
        blue = c;
    }
    else {
        red = c;
        blue = x;
    }
    return {
        r: Math.round((red + m) * 255),
        g: Math.round((green + m) * 255),
        b: Math.round((blue + m) * 255),
    };
};
exports.hsvToRgb = hsvToRgb;
/**
 * 十六进制转 hsv
 */
var hexToHsv = function (hex) {
    var rgb = (0, exports.hexToRgb)(hex);
    if (!rgb) {
        return null;
    }
    return (0, exports.rgbToHsv)(rgb.r, rgb.g, rgb.b);
};
exports.hexToHsv = hexToHsv;
/**
 * hsv 转十六进制
 */
var hsvToHex = function (h, s, v) {
    var rgb = (0, exports.hsvToRgb)(h, s, v);
    return (0, exports.rgbToHex)(rgb.r, rgb.g, rgb.b);
};
exports.hsvToHex = hsvToHex;
/**
 * 解析颜色字符串，支持十六进制（三位/六位/可选井号）、rgb()、hsl()
 */
var parseColor = function (input) {
    if (typeof input !== 'string') {
        return null;
    }
    var value = input.trim();
    var hexRgb = (0, exports.hexToRgb)(value);
    if (hexRgb) {
        return hexRgb;
    }
    var rgbMatch = value.match(RGB_REG);
    if (rgbMatch) {
        var r = Number(rgbMatch[1]);
        var g = Number(rgbMatch[2]);
        var b = Number(rgbMatch[3]);
        if (r <= 255 && g <= 255 && b <= 255) {
            return { r: r, g: g, b: b };
        }
        return null;
    }
    var hslMatch = value.match(HSL_REG);
    if (hslMatch) {
        return (0, exports.hslToRgb)(Number(hslMatch[1]), Number(hslMatch[2]) / 100, Number(hslMatch[3]) / 100);
    }
    return null;
};
exports.parseColor = parseColor;
/**
 * 判断一段字符串是否为合法颜色
 */
var isValidColor = function (input) { return (0, exports.parseColor)(input) !== null; };
exports.isValidColor = isValidColor;
/**
 * 按色相加减得到新色，色相取模到 [0, 360)
 */
var adjustHue = function (color, amount) {
    var rgb = (0, exports.parseColor)(color);
    if (!rgb) {
        return color;
    }
    var hsl = (0, exports.rgbToHsl)(rgb.r, rgb.g, rgb.b);
    return (0, exports.hslToHex)(hsl.h + amount, hsl.s, hsl.l);
};
exports.adjustHue = adjustHue;
/**
 * 按明度加减得到新色，明度截断到 [0, 1]，小基数不会被截成零
 */
var adjustLightness = function (color, amount) {
    var rgb = (0, exports.parseColor)(color);
    if (!rgb) {
        return color;
    }
    var hsl = (0, exports.rgbToHsl)(rgb.r, rgb.g, rgb.b);
    var lightness = clamp(hsl.l + amount, 0, 1);
    return (0, exports.hslToHex)(hsl.h, hsl.s, lightness);
};
exports.adjustLightness = adjustLightness;
/**
 * 获取颜色明度（hsl 的 l），非法颜色返回 0
 */
var getLightness = function (color) {
    var rgb = (0, exports.parseColor)(color);
    if (!rgb) {
        return 0;
    }
    return (0, exports.rgbToHsl)(rgb.r, rgb.g, rgb.b).l;
};
exports.getLightness = getLightness;
/**
 * 把一组颜色按明度从亮到暗排序，不改动原数组
 */
var sortByLightness = function (colors) {
    return colors.slice().sort(function (prev, next) { return (0, exports.getLightness)(next) - (0, exports.getLightness)(prev); });
};
exports.sortByLightness = sortByLightness;
/**
 * 获取相对亮度（WCAG）
 */
var getLuminance = function (color) {
    var rgb = (0, exports.parseColor)(color);
    if (!rgb) {
        return 0;
    }
    var transform = function (channel) {
        var value = channel / 255;
        return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * transform(rgb.r) + 0.7152 * transform(rgb.g) + 0.0722 * transform(rgb.b);
};
exports.getLuminance = getLuminance;
/**
 * 两个颜色的对比度（WCAG），取值 [1, 21]
 */
var getContrast = function (color1, color2) {
    var luminance1 = (0, exports.getLuminance)(color1);
    var luminance2 = (0, exports.getLuminance)(color2);
    var light = Math.max(luminance1, luminance2);
    var dark = Math.min(luminance1, luminance2);
    return Number(((light + 0.05) / (dark + 0.05)).toFixed(2));
};
exports.getContrast = getContrast;
/**
 * 从候选色里挑与背景对比度最高的那个当前景色
 */
var pickContrastColor = function (background, candidates) {
    if (candidates === void 0) { candidates = ['#000000', '#ffffff']; }
    var best = candidates[0] || '#000000';
    var bestContrast = 0;
    candidates.forEach(function (candidate) {
        var contrast = (0, exports.getContrast)(background, candidate);
        if (contrast > bestContrast) {
            best = candidate;
            bestContrast = contrast;
        }
    });
    return best;
};
exports.pickContrastColor = pickContrastColor;
