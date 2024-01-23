import React from 'react';

type Props = {
   children: React.ReactNode;
   className?: string;
};

const Page: React.FC<Props> = ({ children, className = '' }) => (
   <div className="flex w-full h-full overflow-hidden">
      <div className={`w-full h-full bg-dark-100 dark:bg-light-100 ${className}`}>{children}</div>
   </div>
);

export default Page;
