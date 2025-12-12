import './home.scss';

import React from 'react';
import HttpMetricsProfessional from 'app/entities/http-metrics/http-metrics-professional';

export const Home = () => {
  return (
    <div className="dashboard-home">
      <HttpMetricsProfessional />
    </div>
  );
};

export default Home;
