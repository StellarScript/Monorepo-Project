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
      include: ['test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      reporters: ['default'],
      coverage: {
         reportsDirectory: '../../coverage/apps/server',
         provider: 'v8',
      },
   },
});
