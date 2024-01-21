import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
   plugins: [nxViteTsPaths()],
   test: {
      globals: true,
      cache: {
         dir: '../../node_modules/.vitest',
      },
      environment: 'node',
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      reporters: ['default'],
      coverage: {
         reportsDirectory: '../../coverage/libs/construct',
         provider: 'v8',
      },
   },
   build: {
      outDir: '../../dist/libs/shared',
      reportCompressedSize: true,
      commonjsOptions: {
         transformMixedEsModules: true,
      },
      lib: {
         // Could also be a dictionary or array of multiple entry points.
         entry: 'src',
         name: 'shared',
         fileName: 'index',
      },
      rollupOptions: {
         // External packages that should not be bundled into your library.
         external: ['@appify/shared/config'],
      },
   },
});
