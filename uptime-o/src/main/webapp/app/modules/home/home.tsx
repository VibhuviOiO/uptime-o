import './home.scss';

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StatusPage from './components/StatusPage';

export const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHomePage = async () => {
      try {
        const response = await axios.get('/api/public/status-page/homepage');
        if (response.data && response.data.slug) {
          navigate(`/public-status/${response.data.slug}`, { replace: true });
        } else {
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
      }
    };
    checkHomePage();
  }, [navigate]);

  if (loading) {
    return <div className="dashboard-home">Loading...</div>;
  }

  return (
    <div className="dashboard-home">
      <StatusPage />
    </div>
  );
};

export default Home;
