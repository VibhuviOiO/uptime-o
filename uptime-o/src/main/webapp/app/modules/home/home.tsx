import './home.scss';

import React from 'react';
import { PrivateStatusPage } from './components/StatusPage';

export const Home = () => {
  return (
    <div className="dashboard-home">
      <PrivateStatusPage />
    </div>
  );
};

export default Home;
