'use client';

import React, { createContext, useContext } from 'react';

export type ThemeContextType = {
   readonly darkMode: boolean;
   readonly toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
   darkMode: false,
   toggleTheme: () => null,
});

export const useTheme = () => {
   return useContext(ThemeContext);
};

const ThemeProvider: React.FC<{ children: React.ReactElement }> = ({ children }) => {
   const [darkMode, setTheme] = React.useState<boolean>(false);
   const toggleTheme = () => setTheme(!darkMode);
   const theme = darkMode ? 'dark' : '';

   return (
      <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
         <body className={`${theme} transition delay-1000 duration-1000 ease-in-out`}>{children}</body>
      </ThemeContext.Provider>
   );
};

export default ThemeProvider;
