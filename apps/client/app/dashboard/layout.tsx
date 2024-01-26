import '@styles/global.css';
import '@styles/custom.css';
import React from 'react';

export const metadata = {
   title: 'Dashboard',
   description: 'user dashboard',
};

export default function Layout({ children }: { children: React.ReactNode }) {
   return <main>{children}</main>;
}
