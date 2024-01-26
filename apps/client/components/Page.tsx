import React from 'react';

type PageProps = {
   className?: string;
   children: React.ReactNode;
};

export const Page: React.FC<PageProps> = ({ children, className = '' }) => (
   <div className="flex w-full h-full overflow-hidden">
      <div className={`w-full h-full bg-dark-100 dark:bg-light-100 ${className}`}>{children}</div>
   </div>
);
