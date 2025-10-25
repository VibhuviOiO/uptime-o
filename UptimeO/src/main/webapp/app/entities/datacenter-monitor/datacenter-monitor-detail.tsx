import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './datacenter-monitor.reducer';

export const DatacenterMonitorDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const datacenterMonitorEntity = useAppSelector(state => state.datacenterMonitor.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="datacenterMonitorDetailsHeading">Datacenter Monitor</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{datacenterMonitorEntity.id}</dd>
          <dt>Datacenter</dt>
          <dd>{datacenterMonitorEntity.datacenter ? datacenterMonitorEntity.datacenter.id : ''}</dd>
          <dt>Monitor</dt>
          <dd>{datacenterMonitorEntity.monitor ? datacenterMonitorEntity.monitor.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/datacenter-monitor" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/datacenter-monitor/${datacenterMonitorEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

export default DatacenterMonitorDetail;
