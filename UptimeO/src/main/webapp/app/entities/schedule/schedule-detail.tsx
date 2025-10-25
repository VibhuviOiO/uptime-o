import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './schedule.reducer';

export const ScheduleDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const scheduleEntity = useAppSelector(state => state.schedule.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="scheduleDetailsHeading">Schedule</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{scheduleEntity.id}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{scheduleEntity.name}</dd>
          <dt>
            <span id="interval">Interval</span>
          </dt>
          <dd>{scheduleEntity.interval}</dd>
          <dt>
            <span id="includeResponseBody">Include Response Body</span>
          </dt>
          <dd>{scheduleEntity.includeResponseBody ? 'true' : 'false'}</dd>
          <dt>
            <span id="thresholdsWarning">Thresholds Warning</span>
          </dt>
          <dd>{scheduleEntity.thresholdsWarning}</dd>
          <dt>
            <span id="thresholdsCritical">Thresholds Critical</span>
          </dt>
          <dd>{scheduleEntity.thresholdsCritical}</dd>
        </dl>
        <Button tag={Link} to="/schedule" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/schedule/${scheduleEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

export default ScheduleDetail;
