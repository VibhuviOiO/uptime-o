import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Col, Row, Table, Spinner, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './http-monitor.reducer';

interface IDeployedDatacenter {
  id: number;
  datacenterId: number;
  datacenterName: string;
  datacenterCode: string;
}

export const HttpMonitorDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  const [deployedDatacenters, setDeployedDatacenters] = useState<IDeployedDatacenter[]>([]);
  const [loadingDatacenters, setLoadingDatacenters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const httpMonitorEntity = useAppSelector(state => state.httpMonitor.entity);

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  useEffect(() => {
    if (httpMonitorEntity.id) {
      fetchDeployedDatacenters();
    }
  }, [httpMonitorEntity.id]);

  const fetchDeployedDatacenters = async () => {
    try {
      setLoadingDatacenters(true);
      setError(null);
      const response = await axios.get<any>(`/api/datacenter-monitors?size=1000&filter=monitor.id=${httpMonitorEntity.id}`);
      const data = Array.isArray(response.data) ? response.data : response.data.content || [];

      const datacenters: IDeployedDatacenter[] = data.map((dcm: any) => ({
        id: dcm.id,
        datacenterId: dcm.datacenter?.id,
        datacenterName: dcm.datacenter?.name,
        datacenterCode: dcm.datacenter?.code,
      }));

      setDeployedDatacenters(datacenters);
    } catch (err) {
      setError('Failed to load deployed datacenters');
      console.error('Error fetching deployed datacenters:', err);
    } finally {
      setLoadingDatacenters(false);
    }
  };

  const handleRemoveDatacenter = async (assignmentId: number) => {
    try {
      await axios.delete(`/api/datacenter-monitors/${assignmentId}`);
      setDeployedDatacenters(deployedDatacenters.filter(d => d.id !== assignmentId));
    } catch (err) {
      setError('Failed to remove datacenter assignment');
      console.error('Error removing assignment:', err);
    }
  };

  return (
    <Row>
      <Col md="8">
        <h2 data-cy="apiMonitorDetailsHeading">HTTP Monitor</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{httpMonitorEntity.id}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{httpMonitorEntity.name}</dd>
          <dt>
            <span id="method">Method</span>
          </dt>
          <dd>{httpMonitorEntity.method}</dd>
          <dt>
            <span id="type">Type</span>
          </dt>
          <dd>{httpMonitorEntity.type}</dd>
          <dt>
            <span id="url">Url</span>
          </dt>
          <dd>{httpMonitorEntity.url}</dd>
          <dt>
            <span id="headers">Headers</span>
          </dt>
          <dd>{httpMonitorEntity.headers}</dd>
          <dt>
            <span id="body">Body</span>
          </dt>
          <dd>{httpMonitorEntity.body}</dd>
          <dt>Schedule</dt>
          <dd>{httpMonitorEntity.schedule ? httpMonitorEntity.schedule.id : ''}</dd>
        </dl>

        {/* Deployed To Section */}
        <div className="mt-4">
          <h4>
            <FontAwesomeIcon icon="link" className="me-2" />
            Deployed To Datacenters
          </h4>
          {error && <Alert color="danger">{error}</Alert>}

          {loadingDatacenters ? (
            <div className="text-center p-3">
              <Spinner color="primary" size="sm" className="me-2" />
              Loading datacenters...
            </div>
          ) : deployedDatacenters.length === 0 ? (
            <Alert color="info">This monitor is not assigned to any datacenters yet.</Alert>
          ) : (
            <div className="table-responsive">
              <Table striped hover size="sm">
                <thead>
                  <tr>
                    <th>Datacenter Name</th>
                    <th>Code</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deployedDatacenters.map(dc => (
                    <tr key={dc.id}>
                      <td>
                        <Link to={`/datacenter/${dc.datacenterId}`}>{dc.datacenterName}</Link>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.85em' }}>{dc.datacenterCode}</code>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          color="danger"
                          onClick={() => handleRemoveDatacenter(dc.id)}
                          title="Remove this datacenter assignment"
                        >
                          <FontAwesomeIcon icon="trash" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          <Button
            tag={Link}
            to="/http-monitor"
            onClick={() => {
              // This would open the assign modal, but for now direct to list
              // where user can click Assign button
            }}
            className="btn btn-sm btn-warning mt-2"
          >
            <FontAwesomeIcon icon="link" className="me-2" />
            Manage Assignments
          </Button>
        </div>

        <div className="mt-4">
          <Button tag={Link} to="/http-monitor" replace color="info" data-cy="entityDetailsBackButton">
            <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
          </Button>
          &nbsp;
          <Button tag={Link} to={`/http-monitor/${httpMonitorEntity.id}/edit`} replace color="primary">
            <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
          </Button>
        </div>
      </Col>
    </Row>
  );
};

export default HttpMonitorDetail;
