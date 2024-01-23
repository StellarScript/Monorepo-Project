'use client';

import React from 'react';
import { useTheme } from '@providers/theme';

const Header: React.FC = () => {
   const { darkMode, toggleTheme } = useTheme();

   return (
      <div>
         <div className="inline-flex justify-center align-items">
            <div className="flex w-[80px] justify-center">
               <button onClick={() => toggleTheme()} className="theme-toggle">
                  {darkMode ? <div className="sun-toggle"></div> : <div className="moon-toggle"></div>}
               </button>
            </div>
         </div>
      </div>
   );
};

export default Header;
