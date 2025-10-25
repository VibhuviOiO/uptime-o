import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './audit-log.reducer';

export const AuditLogDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const auditLogEntity = useAppSelector(state => state.auditLog.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="auditLogDetailsHeading">Audit Log</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{auditLogEntity.id}</dd>
          <dt>
            <span id="action">Action</span>
          </dt>
          <dd>{auditLogEntity.action}</dd>
          <dt>
            <span id="entityName">Entity Name</span>
          </dt>
          <dd>{auditLogEntity.entityName}</dd>
          <dt>
            <span id="entityId">Entity Id</span>
          </dt>
          <dd>{auditLogEntity.entityId}</dd>
          <dt>
            <span id="oldValue">Old Value</span>
          </dt>
          <dd>{auditLogEntity.oldValue}</dd>
          <dt>
            <span id="newValue">New Value</span>
          </dt>
          <dd>{auditLogEntity.newValue}</dd>
          <dt>
            <span id="timestamp">Timestamp</span>
          </dt>
          <dd>{auditLogEntity.timestamp ? <TextFormat value={auditLogEntity.timestamp} type="date" format={APP_DATE_FORMAT} /> : null}</dd>
          <dt>
            <span id="ipAddress">Ip Address</span>
          </dt>
          <dd>{auditLogEntity.ipAddress}</dd>
          <dt>
            <span id="userAgent">User Agent</span>
          </dt>
          <dd>{auditLogEntity.userAgent}</dd>
          <dt>User</dt>
          <dd>{auditLogEntity.user ? auditLogEntity.user.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/audit-log" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/audit-log/${auditLogEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

export default AuditLogDetail;
