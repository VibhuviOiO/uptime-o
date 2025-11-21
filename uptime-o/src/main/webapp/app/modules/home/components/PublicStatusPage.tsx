import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import StatusPage from './StatusPage';

const PublicStatusPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [isValidSlug, setIsValidSlug] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateSlug = async () => {
      try {
        await axios.get(`/api/public/status-page/${slug}`);
        setIsValidSlug(true);
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
      validateSlug();
    }
  }, [slug]);

  if (loading) {
    return <div className="status-page-loading">Loading status page...</div>;
  }

  if (error) {
    return (
      <div className="status-page-empty">
        <h2>Status Page Not Found</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!isValidSlug) {
    return (
      <div className="status-page-empty">
        <h2>Invalid Status Page</h2>
        <p>The requested status page does not exist.</p>
      </div>
    );
  }

  return <StatusPage />;
};

export default PublicStatusPage;
