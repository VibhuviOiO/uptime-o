import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Row, Col, Badge } from 'reactstrap';
import { TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntity } from './instance.reducer';
import { APP_DATE_FORMAT } from 'app/config/constants';

export const InstanceDetail = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const instanceEntity = useAppSelector(state => state.instance.entity);

  return (
    <Row>
      <Col md="8">
        <h2>Instance [{instanceEntity.id}]</h2>
        <dl className="jh-entity-details">
          <dt>
            <span>Name</span>
          </dt>
          <dd>{instanceEntity.name}</dd>
          <dt>
            <span>Hostname</span>
          </dt>
          <dd>{instanceEntity.hostname}</dd>
          <dt>
            <span>Description</span>
          </dt>
          <dd>{instanceEntity.description}</dd>
          <dt>
            <span>Instance Type</span>
          </dt>
          <dd>
            <Badge color="info">{instanceEntity.instanceType}</Badge>
          </dd>
          <dt>
            <span>Monitoring Type</span>
          </dt>
          <dd>
            <Badge color="primary">{instanceEntity.monitoringType}</Badge>
          </dd>
          <dt>
            <span>Operating System</span>
          </dt>
          <dd>{instanceEntity.operatingSystem}</dd>
          <dt>
            <span>Platform</span>
          </dt>
          <dd>{instanceEntity.platform}</dd>
          <dt>
            <span>Private IP</span>
          </dt>
          <dd>{instanceEntity.privateIpAddress}</dd>
          <dt>
            <span>Public IP</span>
          </dt>
          <dd>{instanceEntity.publicIpAddress}</dd>
          <dt>
            <span>Datacenter</span>
          </dt>
          <dd>{instanceEntity.datacenterName}</dd>
          <dt>
            <span>Ping Enabled</span>
          </dt>
          <dd>{instanceEntity.pingEnabled ? 'Yes' : 'No'}</dd>
          {instanceEntity.pingEnabled && (
            <>
              <dt>
                <span>Ping Interval</span>
              </dt>
              <dd>{instanceEntity.pingInterval}s</dd>
            </>
          )}
          <dt>
            <span>Hardware Monitoring</span>
          </dt>
          <dd>{instanceEntity.hardwareMonitoringEnabled ? 'Yes' : 'No'}</dd>
          <dt>
            <span>Created At</span>
          </dt>
          <dd>{instanceEntity.createdAt ? <TextFormat value={instanceEntity.createdAt} type="date" format={APP_DATE_FORMAT} /> : null}</dd>
        </dl>
        <Button tag={Link} to="/instance" replace color="info">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
      </Col>
    </Row>
  );
};

export default InstanceDetail;
