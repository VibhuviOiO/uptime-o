import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './http-heartbeat.reducer';

export const HttpHeartbeatDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const apiHeartbeatEntity = useAppSelector(state => state.apiHeartbeat.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="apiHeartbeatDetailsHeading">Api Heartbeat</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{apiHeartbeatEntity.id}</dd>
          <dt>
            <span id="executedAt">Executed At</span>
          </dt>
          <dd>
            {apiHeartbeatEntity.executedAt ? (
              <TextFormat value={apiHeartbeatEntity.executedAt} type="date" format={APP_DATE_FORMAT} />
            ) : null}
          </dd>
          <dt>
            <span id="success">Success</span>
          </dt>
          <dd>{apiHeartbeatEntity.success ? 'true' : 'false'}</dd>
          <dt>
            <span id="responseTimeMs">Response Time Ms</span>
          </dt>
          <dd>{apiHeartbeatEntity.responseTimeMs}</dd>
          <dt>
            <span id="responseSizeBytes">Response Size Bytes</span>
          </dt>
          <dd>{apiHeartbeatEntity.responseSizeBytes}</dd>
          <dt>
            <span id="responseStatusCode">Response Status Code</span>
          </dt>
          <dd>{apiHeartbeatEntity.responseStatusCode}</dd>
          <dt>
            <span id="responseContentType">Response Content Type</span>
          </dt>
          <dd>{apiHeartbeatEntity.responseContentType}</dd>
          <dt>
            <span id="responseServer">Response Server</span>
          </dt>
          <dd>{apiHeartbeatEntity.responseServer}</dd>
          <dt>
            <span id="responseCacheStatus">Response Cache Status</span>
          </dt>
          <dd>{apiHeartbeatEntity.responseCacheStatus}</dd>
          <dt>
            <span id="dnsLookupMs">Dns Lookup Ms</span>
          </dt>
          <dd>{apiHeartbeatEntity.dnsLookupMs}</dd>
          <dt>
            <span id="tcpConnectMs">Tcp Connect Ms</span>
          </dt>
          <dd>{apiHeartbeatEntity.tcpConnectMs}</dd>
          <dt>
            <span id="tlsHandshakeMs">Tls Handshake Ms</span>
          </dt>
          <dd>{apiHeartbeatEntity.tlsHandshakeMs}</dd>
          <dt>
            <span id="timeToFirstByteMs">Time To First Byte Ms</span>
          </dt>
          <dd>{apiHeartbeatEntity.timeToFirstByteMs}</dd>
          <dt>
            <span id="warningThresholdMs">Warning Threshold Ms</span>
          </dt>
          <dd>{apiHeartbeatEntity.warningThresholdMs}</dd>
          <dt>
            <span id="criticalThresholdMs">Critical Threshold Ms</span>
          </dt>
          <dd>{apiHeartbeatEntity.criticalThresholdMs}</dd>
          <dt>
            <span id="errorType">Error Type</span>
          </dt>
          <dd>{apiHeartbeatEntity.errorType}</dd>
          <dt>
            <span id="errorMessage">Error Message</span>
          </dt>
          <dd>{apiHeartbeatEntity.errorMessage}</dd>
          <dt>
            <span id="rawRequestHeaders">Raw Request Headers</span>
          </dt>
          <dd>{apiHeartbeatEntity.rawRequestHeaders}</dd>
          <dt>
            <span id="rawResponseHeaders">Raw Response Headers</span>
          </dt>
          <dd>{apiHeartbeatEntity.rawResponseHeaders}</dd>
          <dt>
            <span id="rawResponseBody">Raw Response Body</span>
          </dt>
          <dd>{apiHeartbeatEntity.rawResponseBody}</dd>
          <dt>Monitor</dt>
          <dd>{apiHeartbeatEntity.monitor ? apiHeartbeatEntity.monitor.id : ''}</dd>
          <dt>Agent</dt>
          <dd>{apiHeartbeatEntity.agent ? apiHeartbeatEntity.agent.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/http-heartbeats" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/http-heartbeats/${apiHeartbeatEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

export default HttpHeartbeatDetail;
