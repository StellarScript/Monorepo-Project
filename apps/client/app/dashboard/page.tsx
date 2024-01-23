import React from 'react';
import Page from '@components/Page';
import Header from '@components/Header';

const DashboardPage: React.FC = () => {
   return (
      <Page>
         <Header />
         <div>
            <h1>Dashboard</h1>
         </div>
      </Page>
   );
};

export default DashboardPage;
