import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntities as getHttpMonitors } from 'app/entities/http-monitor/http-monitor.reducer';
import { getEntities as getAgents } from 'app/entities/agent/agent.reducer';
import { createEntity, getEntity, reset, updateEntity } from './http-heartbeat.reducer';

export const ApiHeartbeatUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const apiMonitors = useAppSelector(state => state.httpMonitor.entities);
  const agents = useAppSelector(state => state.agent.entities);
  const apiHeartbeatEntity = useAppSelector(state => state.apiHeartbeat.entity);
  const loading = useAppSelector(state => state.apiHeartbeat.loading);
  const updating = useAppSelector(state => state.apiHeartbeat.updating);
  const updateSuccess = useAppSelector(state => state.apiHeartbeat.updateSuccess);

  const handleClose = () => {
    navigate(`/api-heartbeat${location.search}`);
  };

  useEffect(() => {
    if (isNew) {
      dispatch(reset());
    } else {
      dispatch(getEntity(id));
    }

    dispatch(getHttpMonitors({}));
    dispatch(getAgents({}));
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    if (values.id !== undefined && typeof values.id !== 'number') {
      values.id = Number(values.id);
    }
    values.executedAt = convertDateTimeToServer(values.executedAt);
    if (values.responseTimeMs !== undefined && typeof values.responseTimeMs !== 'number') {
      values.responseTimeMs = Number(values.responseTimeMs);
    }
    if (values.responseSizeBytes !== undefined && typeof values.responseSizeBytes !== 'number') {
      values.responseSizeBytes = Number(values.responseSizeBytes);
    }
    if (values.responseStatusCode !== undefined && typeof values.responseStatusCode !== 'number') {
      values.responseStatusCode = Number(values.responseStatusCode);
    }
    if (values.dnsLookupMs !== undefined && typeof values.dnsLookupMs !== 'number') {
      values.dnsLookupMs = Number(values.dnsLookupMs);
    }
    if (values.tcpConnectMs !== undefined && typeof values.tcpConnectMs !== 'number') {
      values.tcpConnectMs = Number(values.tcpConnectMs);
    }
    if (values.tlsHandshakeMs !== undefined && typeof values.tlsHandshakeMs !== 'number') {
      values.tlsHandshakeMs = Number(values.tlsHandshakeMs);
    }
    if (values.timeToFirstByteMs !== undefined && typeof values.timeToFirstByteMs !== 'number') {
      values.timeToFirstByteMs = Number(values.timeToFirstByteMs);
    }
    if (values.warningThresholdMs !== undefined && typeof values.warningThresholdMs !== 'number') {
      values.warningThresholdMs = Number(values.warningThresholdMs);
    }
    if (values.criticalThresholdMs !== undefined && typeof values.criticalThresholdMs !== 'number') {
      values.criticalThresholdMs = Number(values.criticalThresholdMs);
    }

    const entity = {
      ...apiHeartbeatEntity,
      ...values,
      monitor: apiMonitors.find(it => it.id.toString() === values.monitor?.toString()),
      agent: agents.find(it => it.id.toString() === values.agent?.toString()),
    };

    if (isNew) {
      dispatch(createEntity(entity));
    } else {
      dispatch(updateEntity(entity));
    }
  };

  const defaultValues = () =>
    isNew
      ? {
          executedAt: displayDefaultDateTime(),
        }
      : {
          ...apiHeartbeatEntity,
          executedAt: convertDateTimeFromServer(apiHeartbeatEntity.executedAt),
          monitor: apiHeartbeatEntity?.monitor?.id,
          agent: apiHeartbeatEntity?.agent?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="uptimeOApp.apiHeartbeat.home.createOrEditLabel" data-cy="ApiHeartbeatCreateUpdateHeading">
            Create or edit a Api Heartbeat
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? (
                <ValidatedField name="id" required readOnly id="api-heartbeat-id" label="ID" validate={{ required: true }} />
              ) : null}
              <ValidatedField
                label="Executed At"
                id="api-heartbeat-executedAt"
                name="executedAt"
                data-cy="executedAt"
                type="datetime-local"
                placeholder="YYYY-MM-DD HH:mm"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField label="Success" id="api-heartbeat-success" name="success" data-cy="success" check type="checkbox" />
              <ValidatedField
                label="Response Time Ms"
                id="api-heartbeat-responseTimeMs"
                name="responseTimeMs"
                data-cy="responseTimeMs"
                type="text"
              />
              <ValidatedField
                label="Response Size Bytes"
                id="api-heartbeat-responseSizeBytes"
                name="responseSizeBytes"
                data-cy="responseSizeBytes"
                type="text"
              />
              <ValidatedField
                label="Response Status Code"
                id="api-heartbeat-responseStatusCode"
                name="responseStatusCode"
                data-cy="responseStatusCode"
                type="text"
              />
              <ValidatedField
                label="Response Content Type"
                id="api-heartbeat-responseContentType"
                name="responseContentType"
                data-cy="responseContentType"
                type="text"
                validate={{
                  maxLength: { value: 50, message: 'This field cannot be longer than 50 characters.' },
                }}
              />
              <ValidatedField
                label="Response Server"
                id="api-heartbeat-responseServer"
                name="responseServer"
                data-cy="responseServer"
                type="text"
                validate={{
                  maxLength: { value: 50, message: 'This field cannot be longer than 50 characters.' },
                }}
              />
              <ValidatedField
                label="Response Cache Status"
                id="api-heartbeat-responseCacheStatus"
                name="responseCacheStatus"
                data-cy="responseCacheStatus"
                type="text"
                validate={{
                  maxLength: { value: 50, message: 'This field cannot be longer than 50 characters.' },
                }}
              />
              <ValidatedField label="Dns Lookup Ms" id="api-heartbeat-dnsLookupMs" name="dnsLookupMs" data-cy="dnsLookupMs" type="text" />
              <ValidatedField
                label="Tcp Connect Ms"
                id="api-heartbeat-tcpConnectMs"
                name="tcpConnectMs"
                data-cy="tcpConnectMs"
                type="text"
              />
              <ValidatedField
                label="Tls Handshake Ms"
                id="api-heartbeat-tlsHandshakeMs"
                name="tlsHandshakeMs"
                data-cy="tlsHandshakeMs"
                type="text"
              />
              <ValidatedField
                label="Time To First Byte Ms"
                id="api-heartbeat-timeToFirstByteMs"
                name="timeToFirstByteMs"
                data-cy="timeToFirstByteMs"
                type="text"
              />
              <ValidatedField
                label="Warning Threshold Ms"
                id="api-heartbeat-warningThresholdMs"
                name="warningThresholdMs"
                data-cy="warningThresholdMs"
                type="text"
              />
              <ValidatedField
                label="Critical Threshold Ms"
                id="api-heartbeat-criticalThresholdMs"
                name="criticalThresholdMs"
                data-cy="criticalThresholdMs"
                type="text"
              />
              <ValidatedField
                label="Error Type"
                id="api-heartbeat-errorType"
                name="errorType"
                data-cy="errorType"
                type="text"
                validate={{
                  maxLength: { value: 50, message: 'This field cannot be longer than 50 characters.' },
                }}
              />
              <ValidatedField
                label="Error Message"
                id="api-heartbeat-errorMessage"
                name="errorMessage"
                data-cy="errorMessage"
                type="textarea"
              />
              <ValidatedField
                label="Raw Request Headers"
                id="api-heartbeat-rawRequestHeaders"
                name="rawRequestHeaders"
                data-cy="rawRequestHeaders"
                type="textarea"
              />
              <ValidatedField
                label="Raw Response Headers"
                id="api-heartbeat-rawResponseHeaders"
                name="rawResponseHeaders"
                data-cy="rawResponseHeaders"
                type="textarea"
              />
              <ValidatedField
                label="Raw Response Body"
                id="api-heartbeat-rawResponseBody"
                name="rawResponseBody"
                data-cy="rawResponseBody"
                type="textarea"
              />
              <ValidatedField id="api-heartbeat-monitor" name="monitor" data-cy="monitor" label="Monitor" type="select">
                <option value="" key="0" />
                {apiMonitors
                  ? apiMonitors.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <ValidatedField id="api-heartbeat-agent" name="agent" data-cy="agent" label="Agent" type="select">
                <option value="" key="0" />
                {agents
                  ? agents.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/api-heartbeat" replace color="info">
                <FontAwesomeIcon icon="arrow-left" />
                &nbsp;
                <span className="d-none d-md-inline">Back</span>
              </Button>
              &nbsp;
              <Button color="primary" id="save-entity" data-cy="entityCreateSaveButton" type="submit" disabled={updating}>
                <FontAwesomeIcon icon="save" />
                &nbsp; Save
              </Button>
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ApiHeartbeatUpdate;
