import './home.scss';

import React from 'react';

export const Home = () => {
  return (
    <div className="dashboard-home">
      <div
        className="coming-soon-container"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '70vh',
          textAlign: 'center',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: '#2c3e50',
            }}
          >
            Status Page
          </h1>
          <p
            style={{
              fontSize: '2rem',
              color: '#7f8c8d',
            }}
          >
            Will come soon
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
