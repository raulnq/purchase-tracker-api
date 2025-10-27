import jseslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';

export default defineConfig(
  jseslint.configs.recommended,
  tseslint.configs.recommended,
  prettierConfig
);
