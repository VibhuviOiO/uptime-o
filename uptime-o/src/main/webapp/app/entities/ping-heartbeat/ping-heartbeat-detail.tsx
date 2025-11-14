import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Row, Col, Badge } from 'reactstrap';
import { TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntity } from './ping-heartbeat.reducer';
import { APP_DATE_FORMAT } from 'app/config/constants';

export const PingHeartbeatDetail = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const pingHeartbeatEntity = useAppSelector(state => state.pingHeartbeat.entity);

  const getStatusColor = status => {
    switch (status) {
      case 'UP':
        return 'success';
      case 'WARNING':
        return 'warning';
      case 'DANGER':
        return 'danger';
      case 'DOWN':
        return 'danger';
      case 'DEGRADED':
        return 'warning';
      case 'TIMEOUT':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <Row>
      <Col md="8">
        <h2>Ping Heartbeat [{pingHeartbeatEntity.id}]</h2>
        <dl className="jh-entity-details">
          <dt>
            <span>Instance ID</span>
          </dt>
          <dd>{pingHeartbeatEntity.instanceId}</dd>
          <dt>
            <span>Executed At</span>
          </dt>
          <dd>
            {pingHeartbeatEntity.executedAt ? (
              <TextFormat value={pingHeartbeatEntity.executedAt} type="date" format={APP_DATE_FORMAT} />
            ) : null}
          </dd>
          <dt>
            <span>Type</span>
          </dt>
          <dd>
            <Badge color="info">{pingHeartbeatEntity.heartbeatType}</Badge>
          </dd>
          <dt>
            <span>Status</span>
          </dt>
          <dd>
            <Badge color={getStatusColor(pingHeartbeatEntity.status)}>{pingHeartbeatEntity.status}</Badge>
          </dd>
          <dt>
            <span>Success</span>
          </dt>
          <dd>{pingHeartbeatEntity.success ? 'Yes' : 'No'}</dd>

          {pingHeartbeatEntity.heartbeatType === 'PING' && (
            <>
              <dt>
                <span>Response Time</span>
              </dt>
              <dd>{pingHeartbeatEntity.responseTimeMs}ms</dd>
              <dt>
                <span>Packet Loss</span>
              </dt>
              <dd>{pingHeartbeatEntity.packetLoss}%</dd>
              <dt>
                <span>Jitter</span>
              </dt>
              <dd>{pingHeartbeatEntity.jitterMs}ms</dd>
            </>
          )}

          {pingHeartbeatEntity.heartbeatType === 'HARDWARE' && (
            <>
              <dt>
                <span>CPU Usage</span>
              </dt>
              <dd>{pingHeartbeatEntity.cpuUsage}%</dd>
              <dt>
                <span>Memory Usage</span>
              </dt>
              <dd>{pingHeartbeatEntity.memoryUsage}%</dd>
              <dt>
                <span>Disk Usage</span>
              </dt>
              <dd>{pingHeartbeatEntity.diskUsage}%</dd>
              <dt>
                <span>Load Average</span>
              </dt>
              <dd>{pingHeartbeatEntity.loadAverage}</dd>
            </>
          )}

          {pingHeartbeatEntity.errorMessage && (
            <>
              <dt>
                <span>Error Message</span>
              </dt>
              <dd>{pingHeartbeatEntity.errorMessage}</dd>
            </>
          )}
        </dl>
        <Button tag={Link} to="/ping-heartbeat" replace color="info">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
      </Col>
    </Row>
  );
};

export default PingHeartbeatDetail;
