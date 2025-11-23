import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Spinner, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faProjectDiagram } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import DependencyTree from '../status-dependency/dependency-tree';

const StatusPageDependencies = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [statusPage, setStatusPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatusPage();
  }, [id]);

  const loadStatusPage = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/status-pages/${id}`);
      setStatusPage(response.data);
    } catch (error) {
      toast.error('Failed to load status page');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner color="primary" />
        <p className="mt-2">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <Card className="mb-3">
        <CardBody>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-1">
                <FontAwesomeIcon icon={faProjectDiagram} className="me-2" />
                {statusPage?.name} - Dependencies
              </h4>
              {statusPage?.description && <p className="text-muted mb-0">{statusPage.description}</p>}
            </div>
            <Button color="secondary" size="sm" onClick={() => navigate('/status-page')}>
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Back to Status Pages
            </Button>
          </div>
        </CardBody>
      </Card>

      <DependencyTree statusPageId={Number(id)} />
    </div>
  );
};

export default StatusPageDependencies;
