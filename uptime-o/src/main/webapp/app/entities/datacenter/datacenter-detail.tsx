import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Col, Row, Table, Spinner, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import axios from 'axios';

import { getEntity } from './datacenter.reducer';

interface IAssignedMonitor {
  id: number;
  monitorId: number;
  monitorName: string;
  monitorUrl: string;
}

export const DatacenterDetail = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams<'id'>();

  const [assignedMonitors, setAssignedMonitors] = useState<IAssignedMonitor[]>([]);
  const [loadingMonitors, setLoadingMonitors] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const datacenterEntity = useAppSelector(state => state.datacenter.entity);

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  useEffect(() => {
    if (datacenterEntity.id) {
      fetchAssignedMonitors();
    }
  }, [datacenterEntity.id]);

  const fetchAssignedMonitors = async () => {
    try {
      setLoadingMonitors(true);
      setError(null);
      const response = await axios.get<any>(`/api/datacenter-monitors?size=1000&filter=datacenter.id=${datacenterEntity.id}`);
      const data = Array.isArray(response.data) ? response.data : response.data.content || [];

      const monitors: IAssignedMonitor[] = data.map((dcm: any) => ({
        id: dcm.id,
        monitorId: dcm.monitor?.id,
        monitorName: dcm.monitor?.name,
        monitorUrl: dcm.monitor?.url,
      }));

      setAssignedMonitors(monitors);
    } catch (err) {
      setError('Failed to load assigned monitors');
      console.error('Error fetching assigned monitors:', err);
    } finally {
      setLoadingMonitors(false);
    }
  };

  const handleRemoveMonitor = async (assignmentId: number) => {
    try {
      await axios.delete(`/api/datacenter-monitors/${assignmentId}`);
      setAssignedMonitors(assignedMonitors.filter(m => m.id !== assignmentId));
    } catch (err) {
      setError('Failed to remove monitor assignment');
      console.error('Error removing assignment:', err);
    }
  };

  return (
    <Row>
      <Col md="8">
        <h2 data-cy="datacenterDetailsHeading">Datacenter</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{datacenterEntity.id}</dd>
          <dt>
            <span id="code">Code</span>
          </dt>
          <dd>{datacenterEntity.code}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{datacenterEntity.name}</dd>
          <dt>Region</dt>
          <dd>{datacenterEntity.region ? datacenterEntity.region.id : ''}</dd>
        </dl>

        {/* Assigned Monitors Section */}
        <div className="mt-4">
          <h4>
            <FontAwesomeIcon icon="link" className="me-2" />
            Assigned Monitors
          </h4>
          {error && <Alert color="danger">{error}</Alert>}

          {loadingMonitors ? (
            <div className="text-center p-3">
              <Spinner color="primary" size="sm" className="me-2" />
              Loading monitors...
            </div>
          ) : assignedMonitors.length === 0 ? (
            <Alert color="info">No monitors assigned to this datacenter yet.</Alert>
          ) : (
            <div className="table-responsive">
              <Table striped hover size="sm">
                <thead>
                  <tr>
                    <th>Monitor Name</th>
                    <th>URL</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedMonitors.map(monitor => (
                    <tr key={monitor.id}>
                      <td>
                        <Link to={`/http-monitor/${monitor.monitorId}`}>{monitor.monitorName}</Link>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.85em' }}>{monitor.monitorUrl}</code>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          color="danger"
                          onClick={() => handleRemoveMonitor(monitor.id)}
                          title="Remove this monitor from datacenter"
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

          <Link to="/http-monitor" className="btn btn-sm btn-info mt-2">
            <FontAwesomeIcon icon="link" className="me-2" />
            Go to HTTP Monitors to Assign
          </Link>
        </div>

        <div className="mt-4">
          <Button tag={Link} to="/datacenter" replace color="info" data-cy="entityDetailsBackButton">
            <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
          </Button>
          &nbsp;
          <Button tag={Link} to={`/datacenter/${datacenterEntity.id}/edit`} replace color="primary">
            <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
          </Button>
        </div>
      </Col>
    </Row>
  );
};

export default DatacenterDetail;
