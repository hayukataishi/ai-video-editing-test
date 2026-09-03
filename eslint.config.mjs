import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/renders/**',
      '**/storybook-static/**',
      '**/.video-cache/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
);
