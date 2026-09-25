"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickForeground = exports.getContrast = exports.getLuminance = exports.sortByLightness = exports.getLightness = exports.adjustLightness = exports.adjustHue = exports.hsvToHex = exports.hexToHsv = exports.hslToHex = exports.hexToHsl = exports.hsvToRgb = exports.rgbToHsv = exports.hslToRgb = exports.rgbToHsl = exports.rgbToHex = exports.hexToRgb = exports.isValidColor = exports.normalizeHue = void 0;
var HEX_PATTERN = /^#?(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
var RGB_PATTERN = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(?:0|1|0?\.\d+)\s*)?\)$/;
var clamp = function (num, min, max) { return Math.min(max, Math.max(min, num)); };
/**
 * 色相归一化到 [0, 360)
 */
var normalizeHue = function (hue) { return ((hue % 360) + 360) % 360; };
exports.normalizeHue = normalizeHue;
/**
 * 判断一段字符串是否为合法颜色（3/6 位十六进制，可带 #，或 rgb()/rgba()）
 */
var isValidColor = function (color) {
    if (typeof color !== 'string') {
        return false;
    }
    var input = color.trim();
    if (HEX_PATTERN.test(input)) {
        return true;
    }
    var rgbMatch = input.match(RGB_PATTERN);
    return !!rgbMatch && [rgbMatch[1], rgbMatch[2], rgbMatch[3]].every(function (channel) { return Number(channel) <= 255; });
};
exports.isValidColor = isValidColor;
/**
 * 十六进制转 rgb，支持 3 位缩写、可带 #、大小写混合
 */
var hexToRgb = function (hex) {
    if (typeof hex !== 'string') {
        return null;
    }
    var input = hex.trim().replace(/^#/, '');
    if (/^[0-9a-fA-F]{3}$/.test(input)) {
        input = input
            .split('')
            .map(function (char) { return char + char; })
            .join('');
    }
    if (!/^[0-9a-fA-F]{6}$/.test(input)) {
        return null;
    }
    var value = parseInt(input, 16);
    return {
        r: (value >> 16) & 255,
        g: (value >> 8) & 255,
        b: value & 255,
    };
};
exports.hexToRgb = hexToRgb;
/**
 * rgb 转十六进制
 */
var rgbToHex = function (r, g, b) {
    var toHex = function (channel) { return clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0'); };
    return "#".concat(toHex(r)).concat(toHex(g)).concat(toHex(b));
};
exports.rgbToHex = rgbToHex;
/**
 * rgb 转 hsl，h ∈ [0, 360)，s/l ∈ [0, 1]
 */
var rgbToHsl = function (r, g, b) {
    var rn = clamp(r, 0, 255) / 255;
    var gn = clamp(g, 0, 255) / 255;
    var bn = clamp(b, 0, 255) / 255;
    var max = Math.max(rn, gn, bn);
    var min = Math.min(rn, gn, bn);
    var l = (max + min) / 2;
    if (max === min) {
        return { h: 0, s: 0, l: l };
    }
    var delta = max - min;
    var s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    var h;
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
    return { h: h, s: s, l: l };
};
exports.rgbToHsl = rgbToHsl;
/**
 * hsl 转 rgb
 */
var hslToRgb = function (h, s, l) {
    var hue = (0, exports.normalizeHue)(h) / 360;
    var saturation = clamp(s, 0, 1);
    var lightness = clamp(l, 0, 1);
    if (saturation === 0) {
        var gray = Math.round(lightness * 255);
        return { r: gray, g: gray, b: gray };
    }
    var q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
    var p = 2 * lightness - q;
    var hueToChannel = function (t) {
        var tn = t;
        if (tn < 0)
            tn += 1;
        if (tn > 1)
            tn -= 1;
        if (tn < 1 / 6)
            return p + (q - p) * 6 * tn;
        if (tn < 1 / 2)
            return q;
        if (tn < 2 / 3)
            return p + (q - p) * (2 / 3 - tn) * 6;
        return p;
    };
    return {
        r: Math.round(hueToChannel(hue + 1 / 3) * 255),
        g: Math.round(hueToChannel(hue) * 255),
        b: Math.round(hueToChannel(hue - 1 / 3) * 255),
    };
};
exports.hslToRgb = hslToRgb;
/**
 * rgb 转 hsv，h ∈ [0, 360)，s/v ∈ [0, 1]
 */
var rgbToHsv = function (r, g, b) {
    var rn = clamp(r, 0, 255) / 255;
    var gn = clamp(g, 0, 255) / 255;
    var bn = clamp(b, 0, 255) / 255;
    var max = Math.max(rn, gn, bn);
    var min = Math.min(rn, gn, bn);
    var delta = max - min;
    var h = 0;
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
        h: h,
        s: max === 0 ? 0 : delta / max,
        v: max,
    };
};
exports.rgbToHsv = rgbToHsv;
/**
 * hsv 转 rgb
 */
var hsvToRgb = function (h, s, v) {
    var hue = (0, exports.normalizeHue)(h);
    var saturation = clamp(s, 0, 1);
    var value = clamp(v, 0, 1);
    var c = value * saturation;
    var x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    var m = value - c;
    var rn = 0;
    var gn = 0;
    var bn = 0;
    if (hue < 60) {
        rn = c;
        gn = x;
    }
    else if (hue < 120) {
        rn = x;
        gn = c;
    }
    else if (hue < 180) {
        gn = c;
        bn = x;
    }
    else if (hue < 240) {
        gn = x;
        bn = c;
    }
    else if (hue < 300) {
        rn = x;
        bn = c;
    }
    else {
        rn = c;
        bn = x;
    }
    return {
        r: Math.round((rn + m) * 255),
        g: Math.round((gn + m) * 255),
        b: Math.round((bn + m) * 255),
    };
};
exports.hsvToRgb = hsvToRgb;
var hexToHsl = function (hex) {
    var _a;
    var rgb = (_a = (0, exports.hexToRgb)(hex)) !== null && _a !== void 0 ? _a : { r: 0, g: 0, b: 0 };
    return (0, exports.rgbToHsl)(rgb.r, rgb.g, rgb.b);
};
exports.hexToHsl = hexToHsl;
var hslToHex = function (h, s, l) {
    var rgb = (0, exports.hslToRgb)(h, s, l);
    return (0, exports.rgbToHex)(rgb.r, rgb.g, rgb.b);
};
exports.hslToHex = hslToHex;
var hexToHsv = function (hex) {
    var _a;
    var rgb = (_a = (0, exports.hexToRgb)(hex)) !== null && _a !== void 0 ? _a : { r: 0, g: 0, b: 0 };
    return (0, exports.rgbToHsv)(rgb.r, rgb.g, rgb.b);
};
exports.hexToHsv = hexToHsv;
var hsvToHex = function (h, s, v) {
    var rgb = (0, exports.hsvToRgb)(h, s, v);
    return (0, exports.rgbToHex)(rgb.r, rgb.g, rgb.b);
};
exports.hsvToHex = hsvToHex;
/**
 * 按色相加减得到新色，色相取模到 [0, 360)
 */
var adjustHue = function (color, amount) {
    var hsl = (0, exports.hexToHsl)(color);
    return (0, exports.hslToHex)(hsl.h + amount, hsl.s, hsl.l);
};
exports.adjustHue = adjustHue;
/**
 * 按明度加减得到新色，明度截断到 [0, 1]，小基数不会被截成 0
 */
var adjustLightness = function (color, amount) {
    var hsl = (0, exports.hexToHsl)(color);
    var lightness = clamp(hsl.l + amount, 0, 1);
    return (0, exports.hslToHex)(hsl.h, hsl.s, lightness);
};
exports.adjustLightness = adjustLightness;
/**
 * 获取颜色明度，∈ [0, 1]
 */
var getLightness = function (color) { return (0, exports.hexToHsl)(color).l; };
exports.getLightness = getLightness;
/**
 * 把一组颜色按明度从亮到暗排序
 */
var sortByLightness = function (colors) {
    return __spreadArray([], colors, true).sort(function (prev, next) { return (0, exports.getLightness)(next) - (0, exports.getLightness)(prev); });
};
exports.sortByLightness = sortByLightness;
var channelToLinear = function (channel) {
    var c = clamp(channel, 0, 255) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
/**
 * WCAG 相对亮度，∈ [0, 1]
 */
var getLuminance = function (color) {
    var _a;
    var rgb = (_a = (0, exports.hexToRgb)(color)) !== null && _a !== void 0 ? _a : { r: 0, g: 0, b: 0 };
    return 0.2126 * channelToLinear(rgb.r) + 0.7152 * channelToLinear(rgb.g) + 0.0722 * channelToLinear(rgb.b);
};
exports.getLuminance = getLuminance;
/**
 * 两个颜色的 WCAG 对比度，∈ [1, 21]
 */
var getContrast = function (color1, color2) {
    var luminance1 = (0, exports.getLuminance)(color1);
    var luminance2 = (0, exports.getLuminance)(color2);
    var lighter = Math.max(luminance1, luminance2);
    var darker = Math.min(luminance1, luminance2);
    return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
};
exports.getContrast = getContrast;
/**
 * 从候选色里挑与背景对比度最高的那个当前景色
 */
var pickForeground = function (background, candidates) {
    var foreground = candidates[0];
    var maxContrast = 0;
    for (var _i = 0, candidates_1 = candidates; _i < candidates_1.length; _i++) {
        var candidate = candidates_1[_i];
        var contrast = (0, exports.getContrast)(background, candidate);
        if (contrast > maxContrast) {
            maxContrast = contrast;
            foreground = candidate;
        }
    }
    return foreground;
};
exports.pickForeground = pickForeground;
