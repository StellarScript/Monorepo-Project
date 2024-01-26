import React from 'react';
import { LogoImage } from '@components/Logo';
import { HeaderButton } from './button';

type WrapperProps = { children: React.ReactNode; className?: string };

export const Wrapper: React.FC<WrapperProps> = ({ children, className }) => (
   <header className={`w-full px-8 ${className}`}>
      <div className="py-6">{children}</div>
   </header>
);

export const Header: React.FC = () => (
   <Wrapper className="bg-inherit border-b border-b-dark-300 dark:border-b-light-300">
      <div className="flex justify-between items-center">
         <div className="shrink-0">
            <a href="#">
               <LogoImage />
            </a>
         </div>
         <div className="inline-flex	justify-center align-items">
            <div className="flex w-[80px] justify-center">
               <HeaderButton />
            </div>
         </div>
      </div>
   </Wrapper>
);
