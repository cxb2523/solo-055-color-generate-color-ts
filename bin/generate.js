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
exports.generateCssVariables = exports.generate = void 0;
var color_1 = require("./color");
var core_1 = require("./core");
var generate = function (primaryColor) {
    var colors = [];
    var hsv = (0, color_1.hexToHsv)(primaryColor);
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
/**
 * 把主题色拼成 css 预处理器变量块
 * @param colors generate 生成的 10 阶色板
 * @param syntax less 用 @ 前缀，scss 用 $ 前缀
 * @returns 变量定义文本
 */
var generateCssVariables = function (colors, syntax) {
    if (syntax === void 0) { syntax = 'less'; }
    var prefix = syntax === 'scss' ? '$' : '@';
    var lines = colors.map(function (color, index) {
        var name = index === core_1.topColorCount ? 'colorPrimary' : "colorPrimary-".concat(index < core_1.topColorCount ? index + 1 : index);
        return "".concat(prefix).concat(name, ": ").concat(color, ";");
    });
    // 主色变量提到最前，与 templates 里的变量块保持一致
    var primary = lines.splice(core_1.topColorCount, 1)[0];
    return __spreadArray(__spreadArray(['/* Primary Color */', primary], lines, true), [''], false).join('\n');
};
exports.generateCssVariables = generateCssVariables;
