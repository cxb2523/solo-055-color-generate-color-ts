import { generate, generateCssVariables } from './generate';

if (typeof window !== 'undefined' && window.ColorGenerate) {
  window.ColorGenerate = generate;
}

export * from './color';
export { generate, generateCssVariables };
