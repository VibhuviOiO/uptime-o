import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './http-monitor.reducer';

export const HttpMonitorDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const httpMonitorEntity = useAppSelector(state => state.httpMonitor.entity);
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
        <Button tag={Link} to="/http-monitor" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/http-monitor/${httpMonitorEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

export default HttpMonitorDetail;
