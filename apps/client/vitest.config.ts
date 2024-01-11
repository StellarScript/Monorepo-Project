/* eslint-disable @nx/enforce-module-boundaries */
/// <reference types="vitest" />
/// <reference types="vite/client" />

import preset from '../..//vitest.config';
import react from '@vitejs/plugin-react';
import { defineConfig, mergeConfig } from 'vitest/config';

export default mergeConfig(
   preset,
   defineConfig({
      plugins: [react()],
      test: {
         globals: true,
         include: ['apps/client/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
         watchExclude: ['node_modules\\/.*', '.*\\/dist\\/.*'],
         includeSource: ['__mocks__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
         mockReset: true,
         clearMocks: true,
      },
   })
);
