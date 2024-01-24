'use client';

import React from 'react';
import { LogoImage } from '@components/Logo';
import { useTheme } from '@providers/theme';
import Wrapper from './wrapper';

const Header: React.FC = () => {
   const { darkMode, toggleTheme } = useTheme();

   return (
      <Wrapper className="bg-inherit border-b border-b-dark-300 dark:border-b-light-300">
         <div className="flex justify-between items-center">
            <div className="shrink-0">
               <a href="#">
                  <LogoImage />
               </a>
            </div>
            <div className="inline-flex	justify-center align-items">
               <div className="flex w-[80px] justify-center">
                  <button onClick={() => toggleTheme()} className="theme-toggle">
                     {darkMode ? (
                        <div className="sun-toggle"></div>
                     ) : (
                        <div className="moon-toggle"></div>
                     )}
                  </button>
               </div>
            </div>
         </div>
      </Wrapper>
   );
};

export default Header;
