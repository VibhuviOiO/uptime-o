import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntities as getHttpMonitors } from 'app/entities/http-monitor/http-monitor.reducer';
import { getEntities as getAgents } from 'app/entities/agent/agent.reducer';
import { createEntity, getEntity, reset, updateEntity } from './http-heartbeat.reducer';

export const HttpHeartbeatUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const [formKey, setFormKey] = useState(0);

  const apiMonitors = useAppSelector(state => state.httpMonitor.entities);
  const agents = useAppSelector(state => state.agent.entities);
  const apiHeartbeatEntity = useAppSelector(state => state.apiHeartbeat.entity);
  const loading = useAppSelector(state => state.apiHeartbeat.loading);
  const updating = useAppSelector(state => state.apiHeartbeat.updating);
  const updateSuccess = useAppSelector(state => state.apiHeartbeat.updateSuccess);

  const handleClose = () => {
    navigate(`/http-heartbeat${location.search}`);
  };

  useEffect(() => {
    if (isNew) {
      dispatch(reset());
    } else {
      // Reset state first to clear old entity data, then fetch new entity
      dispatch(reset());
      dispatch(getEntity(id));
    }

    dispatch(getHttpMonitors({}));
    dispatch(getAgents({}));
  }, [id, isNew, dispatch]);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  useEffect(() => {
    if (!isNew && apiHeartbeatEntity?.id) {
      // Force form to re-render when entity data loads
      setFormKey(prev => prev + 1);
      console.error('Entity loaded, form key updated:', formKey);
    }
  }, [apiHeartbeatEntity?.id]);

  useEffect(() => {
    // After form mounts with new key, populate textarea values
    if (formKey > 0 && !isNew) {
      setTimeout(() => {
        const rawRequestHeadersField = document.getElementById('http-heartbeat-rawRequestHeaders') as HTMLTextAreaElement;
        const rawResponseHeadersField = document.getElementById('http-heartbeat-rawResponseHeaders') as HTMLTextAreaElement;
        const rawResponseBodyField = document.getElementById('http-heartbeat-rawResponseBody') as HTMLTextAreaElement;

        if (rawRequestHeadersField && apiHeartbeatEntity?.rawRequestHeaders) {
          const formattedHeaders = formatJsonValue(apiHeartbeatEntity.rawRequestHeaders);
          rawRequestHeadersField.value = formattedHeaders;
          rawRequestHeadersField.dispatchEvent(new Event('input', { bubbles: true }));
          rawRequestHeadersField.dispatchEvent(new Event('change', { bubbles: true }));
          rawRequestHeadersField.dispatchEvent(new Event('blur', { bubbles: true }));
        }

        if (rawResponseHeadersField && apiHeartbeatEntity?.rawResponseHeaders) {
          const formattedHeaders = formatJsonValue(apiHeartbeatEntity.rawResponseHeaders);
          rawResponseHeadersField.value = formattedHeaders;
          rawResponseHeadersField.dispatchEvent(new Event('input', { bubbles: true }));
          rawResponseHeadersField.dispatchEvent(new Event('change', { bubbles: true }));
          rawResponseHeadersField.dispatchEvent(new Event('blur', { bubbles: true }));
        }

        if (rawResponseBodyField && apiHeartbeatEntity?.rawResponseBody) {
          const formattedBody = formatJsonValue(apiHeartbeatEntity.rawResponseBody);
          rawResponseBodyField.value = formattedBody;
          rawResponseBodyField.dispatchEvent(new Event('input', { bubbles: true }));
          rawResponseBodyField.dispatchEvent(new Event('change', { bubbles: true }));
          rawResponseBodyField.dispatchEvent(new Event('blur', { bubbles: true }));
        }
      }, 100);
    }
  }, [formKey, isNew, apiHeartbeatEntity]);

  const formatJsonValue = (value: any): string => {
    if (!value) {
      return '';
    }
    try {
      if (typeof value === 'string') {
        const parsed = JSON.stringify(JSON.parse(value), null, 2);
        return parsed;
      }
      const stringified = JSON.stringify(value, null, 2);
      return stringified;
    } catch (error) {
      console.error('Error formatting JSON:', error);
      return '';
    }
  };

  const validateJson = (value: string) => {
    if (!value) return undefined;
    try {
      JSON.parse(value);
      return undefined;
    } catch {
      return 'Invalid JSON format.';
    }
  };

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

    // Get latest textarea values from DOM to ensure we have user's edits
    const rawRequestHeadersField = document.getElementById('http-heartbeat-rawRequestHeaders') as HTMLTextAreaElement;
    const rawResponseHeadersField = document.getElementById('http-heartbeat-rawResponseHeaders') as HTMLTextAreaElement;
    const rawResponseBodyField = document.getElementById('http-heartbeat-rawResponseBody') as HTMLTextAreaElement;

    const finalRawRequestHeaders = rawRequestHeadersField?.value || values.rawRequestHeaders;
    const finalRawResponseHeaders = rawResponseHeadersField?.value || values.rawResponseHeaders;
    const finalRawResponseBody = rawResponseBodyField?.value || values.rawResponseBody;

    const entity = {
      ...apiHeartbeatEntity,
      ...values,
      rawRequestHeaders: finalRawRequestHeaders ? JSON.parse(finalRawRequestHeaders) : null,
      rawResponseHeaders: finalRawResponseHeaders ? JSON.parse(finalRawResponseHeaders) : null,
      rawResponseBody: finalRawResponseBody ? JSON.parse(finalRawResponseBody) : null,
      monitor: apiMonitors.find(it => it.id.toString() === values.monitor?.toString()),
      agent: agents.find(it => it.id.toString() === values.agent?.toString()),
    };

    if (isNew) {
      dispatch(createEntity(entity));
    } else {
      dispatch(updateEntity(entity));
    }
  };

  const defaultValues = () => {
    if (isNew) {
      return {
        executedAt: displayDefaultDateTime(),
      };
    }
    return {
      id: apiHeartbeatEntity?.id,
      success: apiHeartbeatEntity?.success,
      responseTimeMs: apiHeartbeatEntity?.responseTimeMs,
      responseSizeBytes: apiHeartbeatEntity?.responseSizeBytes,
      responseStatusCode: apiHeartbeatEntity?.responseStatusCode,
      responseContentType: apiHeartbeatEntity?.responseContentType,
      responseServer: apiHeartbeatEntity?.responseServer,
      responseCacheStatus: apiHeartbeatEntity?.responseCacheStatus,
      dnsLookupMs: apiHeartbeatEntity?.dnsLookupMs,
      tcpConnectMs: apiHeartbeatEntity?.tcpConnectMs,
      tlsHandshakeMs: apiHeartbeatEntity?.tlsHandshakeMs,
      timeToFirstByteMs: apiHeartbeatEntity?.timeToFirstByteMs,
      warningThresholdMs: apiHeartbeatEntity?.warningThresholdMs,
      criticalThresholdMs: apiHeartbeatEntity?.criticalThresholdMs,
      errorType: apiHeartbeatEntity?.errorType,
      errorMessage: apiHeartbeatEntity?.errorMessage,
      rawRequestHeaders: formatJsonValue(apiHeartbeatEntity?.rawRequestHeaders),
      rawResponseHeaders: formatJsonValue(apiHeartbeatEntity?.rawResponseHeaders),
      rawResponseBody: formatJsonValue(apiHeartbeatEntity?.rawResponseBody),
      executedAt: convertDateTimeFromServer(apiHeartbeatEntity.executedAt),
      monitor: apiHeartbeatEntity?.monitor?.id,
      agent: apiHeartbeatEntity?.agent?.id,
    };
  };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="uptimeOApp.apiHeartbeat.home.createOrEditLabel" data-cy="HttpHeartbeatCreateUpdateHeading">
            Create or edit a Api Heartbeat
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm key={formKey} defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? (
                <ValidatedField name="id" required readOnly id="http-heartbeat-id" label="ID" validate={{ required: true }} />
              ) : null}
              <ValidatedField
                label="Executed At"
                id="http-heartbeat-executedAt"
                name="executedAt"
                data-cy="executedAt"
                type="datetime-local"
                placeholder="YYYY-MM-DD HH:mm"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField label="Success" id="http-heartbeat-success" name="success" data-cy="success" check type="checkbox" />
              <ValidatedField
                label="Response Time Ms"
                id="http-heartbeat-responseTimeMs"
                name="responseTimeMs"
                data-cy="responseTimeMs"
                type="text"
              />
              <ValidatedField
                label="Response Size Bytes"
                id="http-heartbeat-responseSizeBytes"
                name="responseSizeBytes"
                data-cy="responseSizeBytes"
                type="text"
              />
              <ValidatedField
                label="Response Status Code"
                id="http-heartbeat-responseStatusCode"
                name="responseStatusCode"
                data-cy="responseStatusCode"
                type="text"
              />
              <ValidatedField
                label="Response Content Type"
                id="http-heartbeat-responseContentType"
                name="responseContentType"
                data-cy="responseContentType"
                type="text"
                validate={{
                  maxLength: { value: 50, message: 'This field cannot be longer than 50 characters.' },
                }}
              />
              <ValidatedField
                label="Response Server"
                id="http-heartbeat-responseServer"
                name="responseServer"
                data-cy="responseServer"
                type="text"
                validate={{
                  maxLength: { value: 50, message: 'This field cannot be longer than 50 characters.' },
                }}
              />
              <ValidatedField
                label="Response Cache Status"
                id="http-heartbeat-responseCacheStatus"
                name="responseCacheStatus"
                data-cy="responseCacheStatus"
                type="text"
                validate={{
                  maxLength: { value: 50, message: 'This field cannot be longer than 50 characters.' },
                }}
              />
              <ValidatedField label="Dns Lookup Ms" id="http-heartbeat-dnsLookupMs" name="dnsLookupMs" data-cy="dnsLookupMs" type="text" />
              <ValidatedField
                label="Tcp Connect Ms"
                id="http-heartbeat-tcpConnectMs"
                name="tcpConnectMs"
                data-cy="tcpConnectMs"
                type="text"
              />
              <ValidatedField
                label="Tls Handshake Ms"
                id="http-heartbeat-tlsHandshakeMs"
                name="tlsHandshakeMs"
                data-cy="tlsHandshakeMs"
                type="text"
              />
              <ValidatedField
                label="Time To First Byte Ms"
                id="http-heartbeat-timeToFirstByteMs"
                name="timeToFirstByteMs"
                data-cy="timeToFirstByteMs"
                type="text"
              />
              <ValidatedField
                label="Warning Threshold Ms"
                id="http-heartbeat-warningThresholdMs"
                name="warningThresholdMs"
                data-cy="warningThresholdMs"
                type="text"
              />
              <ValidatedField
                label="Critical Threshold Ms"
                id="http-heartbeat-criticalThresholdMs"
                name="criticalThresholdMs"
                data-cy="criticalThresholdMs"
                type="text"
              />
              <ValidatedField
                label="Error Type"
                id="http-heartbeat-errorType"
                name="errorType"
                data-cy="errorType"
                type="text"
                validate={{
                  maxLength: { value: 50, message: 'This field cannot be longer than 50 characters.' },
                }}
              />
              <ValidatedField
                label="Error Message"
                id="http-heartbeat-errorMessage"
                name="errorMessage"
                data-cy="errorMessage"
                type="textarea"
              />
              <ValidatedField
                label="Raw Request Headers"
                id="http-heartbeat-rawRequestHeaders"
                name="rawRequestHeaders"
                data-cy="rawRequestHeaders"
                type="textarea"
                validate={{ validate: validateJson }}
              />
              <ValidatedField
                label="Raw Response Headers"
                id="http-heartbeat-rawResponseHeaders"
                name="rawResponseHeaders"
                data-cy="rawResponseHeaders"
                type="textarea"
                validate={{ validate: validateJson }}
              />
              <ValidatedField
                label="Raw Response Body"
                id="http-heartbeat-rawResponseBody"
                name="rawResponseBody"
                data-cy="rawResponseBody"
                type="textarea"
                validate={{ validate: validateJson }}
              />
              <ValidatedField id="http-heartbeat-monitor" name="monitor" data-cy="monitor" label="Monitor" type="select">
                <option value="" key="0" />
                {apiMonitors
                  ? apiMonitors.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <ValidatedField id="http-heartbeat-agent" name="agent" data-cy="agent" label="Agent" type="select">
                <option value="" key="0" />
                {agents
                  ? agents.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/http-heartbeat" replace color="info">
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

export default HttpHeartbeatUpdate;
