"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCssVariables = exports.generate = void 0;
var core_1 = require("./core");
var color_1 = require("./color");
var generate = function (primaryColor) {
    var colors = [];
    var rgb = (0, color_1.parseColor)(primaryColor);
    var hsv = rgb ? (0, color_1.rgbToHsv)(rgb.r, rgb.g, rgb.b) : { h: 0, s: 0, v: 0 };
    // 主色前
    for (var i = core_1.topColorCount; i > 0; i -= 1) {
        var color = (0, color_1.hsvToHex)((0, core_1.getHue)(hsv, i, true), (0, core_1.getSaturation)(hsv, i, true), (0, core_1.getValue)(hsv, i, true));
        colors.push(color);
    }
    // 主色
    colors.push(primaryColor);
    // 主色后
    for (var i = 1; i <= core_1.behindColorCount; i += 1) {
        var color = (0, color_1.hsvToHex)((0, core_1.getHue)(hsv, i), (0, core_1.getSaturation)(hsv, i), (0, core_1.getValue)(hsv, i));
        colors.push(color);
    }
    return colors;
};
exports.generate = generate;
var functionColorMap = {
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
var generateCssVariables = function (colors, lang) {
    if (lang === void 0) { lang = 'less'; }
    var prefix = lang === 'scss' ? '$' : '@';
    var lines = ['/* Primary Color */'];
    lines.push("".concat(prefix, "colorPrimary: ").concat(colors[5], ";"));
    for (var i = 0; i < 9; i += 1) {
        var colorIndex = i < 5 ? i : i + 1;
        lines.push("".concat(prefix, "colorPrimary-").concat(i + 1, ": ").concat(colors[colorIndex], ";"));
    }
    lines.push('', '/* Function Color */');
    Object.keys(functionColorMap).forEach(function (name) {
        lines.push("".concat(prefix).concat(name, ": ").concat(functionColorMap[name], ";"));
    });
    return lines.join('\n');
};
exports.generateCssVariables = generateCssVariables;
