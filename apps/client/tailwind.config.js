const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
   content: [
      join(__dirname, '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'),
      ...createGlobPatternsForDependencies(__dirname),
   ],
   theme: {
      extend: {
         colors: {
            dark: {
               100: '#222222',
               200: '#404040',
               300: '#333',
            },
            light: {
               100: '#ffff',
               200: '#ececec',
               300: '#f2f2f2',
            },
         },
      },
   },
   plugins: [],
   darkMode: 'class',
};
