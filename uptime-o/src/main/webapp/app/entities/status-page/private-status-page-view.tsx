import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardBody, Spinner, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import DependencyTree from '../status-dependency/dependency-tree';

const PrivateStatusPageView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [statusPage, setStatusPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [slug]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/status-pages/by-slug/${slug}`);
      setStatusPage(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Status page not found');
      } else {
        toast.error('Failed to load status page');
      }
      setStatusPage(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner color="primary" />
        <p className="mt-2">Loading status page...</p>
      </div>
    );
  }

  if (!statusPage) {
    return (
      <Alert color="danger">
        <h4>Status Page Not Found</h4>
        <Link to="/status-page">Back to Status Pages</Link>
      </Alert>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <Link to="/status-page" className="btn btn-sm btn-secondary">
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back
        </Link>
      </div>

      <Card>
        <CardBody>
          <h3>{statusPage.name}</h3>
          {statusPage.description && <p className="text-muted">{statusPage.description}</p>}
          <hr />
          <DependencyTree statusPageId={statusPage.id} />
        </CardBody>
      </Card>
    </div>
  );
};

export default PrivateStatusPageView;
