import React from 'react';

import { Page } from '@components/Page';
import { Header } from '@components/Header';
import { Text } from '@components/Text';

export const metadata = {
   title: 'Dashboard',
   description: 'user dashboard',
};

const Dashboard: React.FC = () => (
   <Page>
      <Header />
      <div className="h-[95vh]">
         <Text.P>Dashboard</Text.P>
      </div>
   </Page>
);

export default Dashboard;
