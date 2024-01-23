import '@styles/global.css';
import '@styles/custom.css';

import React from 'react';
import ThemeProvider from '@providers/theme';

const RootLayout: React.FC<{ children: React.ReactElement }> = ({ children }) => (
   <html lang="en">
      <ThemeProvider>
         <main>{children}</main>
      </ThemeProvider>
   </html>
);

export default RootLayout;
