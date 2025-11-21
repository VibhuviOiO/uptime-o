import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { IStatusPage } from 'app/shared/model/status-page.model';
import StatusPage from './StatusPage';

const PrivateStatusPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [statusPageConfig, setStatusPageConfig] = useState<IStatusPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatusPageConfig = async () => {
      try {
        const response = await axios.get<IStatusPage>(`/api/status-pages/by-slug/${slug}`);
        setStatusPageConfig(response.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Status page not found');
        } else {
          setError('Failed to load status page');
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchStatusPageConfig();
    }
  }, [slug]);

  if (loading) {
    return <div className="text-center p-4">Loading status page...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <h2>Status Page Not Found</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      {statusPageConfig && (
        <div
          style={{
            backgroundColor: statusPageConfig.headerColor || '#ffffff',
            color: statusPageConfig.headerTextColor || '#000000',
            padding: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div className="container">
            <h1>{statusPageConfig.name}</h1>
            {statusPageConfig.description && <p>{statusPageConfig.description}</p>}
          </div>
        </div>
      )}
      <div className="container">
        <StatusPage />
      </div>
    </div>
  );
};

export default PrivateStatusPage;
