import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './api-monitor.reducer';

export const ApiMonitorDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const apiMonitorEntity = useAppSelector(state => state.apiMonitor.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="apiMonitorDetailsHeading">Api Monitor</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{apiMonitorEntity.id}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{apiMonitorEntity.name}</dd>
          <dt>
            <span id="method">Method</span>
          </dt>
          <dd>{apiMonitorEntity.method}</dd>
          <dt>
            <span id="type">Type</span>
          </dt>
          <dd>{apiMonitorEntity.type}</dd>
          <dt>
            <span id="url">Url</span>
          </dt>
          <dd>{apiMonitorEntity.url}</dd>
          <dt>
            <span id="headers">Headers</span>
          </dt>
          <dd>{apiMonitorEntity.headers}</dd>
          <dt>
            <span id="body">Body</span>
          </dt>
          <dd>{apiMonitorEntity.body}</dd>
          <dt>Schedule</dt>
          <dd>{apiMonitorEntity.schedule ? apiMonitorEntity.schedule.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/http-monitor" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/http-monitor/${apiMonitorEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

export default ApiMonitorDetail;
