import '@styles/global.css';
import '@styles/custom.css';

import ThemeProvider from '@providers/theme';

export default function RootLayout({ children }: { children: React.ReactNode }) {
   return (
      <html lang="en">
         <ThemeProvider>
            <body>{children}</body>
         </ThemeProvider>
      </html>
   );
}
