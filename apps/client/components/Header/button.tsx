'use client';

import { useTheme } from '@providers/theme';

export const HeaderButton = () => {
   const { darkMode, toggleTheme } = useTheme();

   return (
      <button onClick={() => toggleTheme()} className="theme-toggle">
         {darkMode ? <div className="sun-toggle"></div> : <div className="moon-toggle"></div>}
      </button>
   );
};
