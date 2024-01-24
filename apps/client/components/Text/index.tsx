import React from 'react';

type TextProps = {
   children: React.ReactNode;
   className?: string;
};

const colorClass = 'text-light-100 dark:text-dark-100';

export class Text {
   static P({ children, className }: TextProps) {
      return <p className={`${className} ${colorClass}`}>{children}</p>;
   }

   static Span({ className, children }: TextProps) {
      return <span className={`${className} ${colorClass}`}>{children}</span>;
   }
}

export class Heading {
   static H1({ children, className }: TextProps) {
      return <h1 className={`${className} ${colorClass}`}>{children}</h1>;
   }

   static H2({ className, children }: TextProps) {
      return <h2 className={`${className} ${colorClass}`}>{children}</h2>;
   }
}
