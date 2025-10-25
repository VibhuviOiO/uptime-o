import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './agent.reducer';

export const AgentDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const agentEntity = useAppSelector(state => state.agent.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="agentDetailsHeading">Agent</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{agentEntity.id}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{agentEntity.name}</dd>
          <dt>Datacenter</dt>
          <dd>{agentEntity.datacenter ? agentEntity.datacenter.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/agent" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/agent/${agentEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

export default AgentDetail;
