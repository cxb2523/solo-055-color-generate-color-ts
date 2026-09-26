import { describe, it, expect } from 'vitest';

import { generate, generateCssVariables } from '../src/generate';

describe('generate', () => {
  it('生成 10 级色板，主色居中', () => {
    const colors = generate('#099dfd');

    expect(colors).toHaveLength(10);
    expect(colors[5]).toBe('#099dfd');
    colors.forEach((color, index) => {
      if (index !== 5) {
        expect(color).toMatch(/^#[0-9a-f]{6}$/);
      }
    });
  });

  it('支持三位缩写与大小写混合的基色', () => {
    expect(() => generate('#ABC')).not.toThrow();
    expect(generate('#ABC')).toHaveLength(10);
  });
});

describe('generateCssVariables', () => {
  const colors = generate('#099dfd');

  it('拼接 less 变量块', () => {
    const less = generateCssVariables(colors, 'less');

    expect(less).toContain('@colorPrimary: #099dfd;');
    expect(less).toContain(`@colorPrimary-1: ${colors[0]};`);
    expect(less).toContain(`@colorPrimary-9: ${colors[9]};`);
    expect(less).toContain('@colorSuccess: #67c23a;');
  });

  it('拼接 scss 变量块', () => {
    const scss = generateCssVariables(colors, 'scss');

    expect(scss).toContain('$colorPrimary: #099dfd;');
    expect(scss).toContain(`$colorPrimary-1: ${colors[0]};`);
    expect(scss).toContain(`$colorPrimary-9: ${colors[9]};`);
    expect(scss).toContain('$colorDanger: #f56c6c;');
  });

  it('默认拼接 less 变量块', () => {
    expect(generateCssVariables(colors)).toContain('@colorPrimary: #099dfd;');
  });
});
