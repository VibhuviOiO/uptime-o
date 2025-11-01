import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntities as getSchedules } from 'app/entities/schedule/schedule.reducer';
import { createEntity, getEntity, reset, updateEntity } from './http-monitor.reducer';

export const HttpMonitorUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const [formKey, setFormKey] = useState(0);

  const schedules = useAppSelector(state => state.schedule.entities);
  const httpMonitorEntity = useAppSelector(state => state.httpMonitor.entity);
  const loading = useAppSelector(state => state.httpMonitor.loading);
  const updating = useAppSelector(state => state.httpMonitor.updating);
  const updateSuccess = useAppSelector(state => state.httpMonitor.updateSuccess);

  const handleClose = () => {
    navigate(`/http-monitor${location.search}`);
  };

  useEffect(() => {
    if (isNew) {
      dispatch(reset());
    } else {
      dispatch(getEntity(id));
    }

    dispatch(getSchedules({}));
  }, [id, isNew, dispatch]);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  useEffect(() => {
    if (!isNew && httpMonitorEntity?.id) {
      // Force form to re-render when entity data loads
      setFormKey(prev => prev + 1);
      console.error('Entity loaded, form key updated:', formKey);
    }
  }, [httpMonitorEntity?.id]);

  useEffect(() => {
    // After form mounts with new key, populate textarea values
    if (formKey > 0 && !isNew) {
      setTimeout(() => {
        const headersField = document.getElementById('http-monitor-headers') as HTMLTextAreaElement;
        const bodyField = document.getElementById('http-monitor-body') as HTMLTextAreaElement;

        if (headersField && httpMonitorEntity?.headers) {
          const formattedHeaders = formatJsonValue(httpMonitorEntity.headers);
          headersField.value = formattedHeaders;
          headersField.dispatchEvent(new Event('input', { bubbles: true }));
          headersField.dispatchEvent(new Event('change', { bubbles: true }));
          headersField.dispatchEvent(new Event('blur', { bubbles: true }));
          console.error('Headers populated:', formattedHeaders);
        }

        if (bodyField && httpMonitorEntity?.body) {
          const formattedBody = formatJsonValue(httpMonitorEntity.body);
          bodyField.value = formattedBody;
          bodyField.dispatchEvent(new Event('input', { bubbles: true }));
          bodyField.dispatchEvent(new Event('change', { bubbles: true }));
          bodyField.dispatchEvent(new Event('blur', { bubbles: true }));
          console.error('Body populated:', formattedBody);
        }
      }, 100);
    }
  }, [formKey, isNew, httpMonitorEntity]);

  const formatJsonValue = (value: any): string => {
    console.error('formatJsonValue called with:', value, 'Type:', typeof value);
    if (!value) {
      console.error('Value is falsy, returning empty string');
      return '';
    }
    try {
      if (typeof value === 'string') {
        const parsed = JSON.stringify(JSON.parse(value), null, 2);
        console.error('Formatted string value to:', parsed);
        return parsed;
      }
      const stringified = JSON.stringify(value, null, 2);
      console.error('Formatted object value to:', stringified);
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

  const defaultValues = () => {
    if (isNew) {
      return {};
    }
    // Don't spread httpMonitorEntity first - build object explicitly
    const values = {
      id: httpMonitorEntity?.id,
      name: httpMonitorEntity?.name,
      method: httpMonitorEntity?.method,
      type: httpMonitorEntity?.type,
      url: httpMonitorEntity?.url,
      headers: formatJsonValue(httpMonitorEntity?.headers),
      body: formatJsonValue(httpMonitorEntity?.body),
      schedule: httpMonitorEntity?.schedule?.id,
    };
    console.error('DefaultValues being set:', values);
    console.error('Raw httpMonitorEntity:', httpMonitorEntity);
    return values;
  };

  const saveEntity = values => {
    console.error('saveEntity called with values:', values);

    if (values.id !== undefined && typeof values.id !== 'number') {
      values.id = Number(values.id);
    }

    // Get latest textarea values from DOM to ensure we have user's edits
    const headersField = document.getElementById('http-monitor-headers') as HTMLTextAreaElement;
    const bodyField = document.getElementById('http-monitor-body') as HTMLTextAreaElement;

    const finalHeaders = headersField?.value || values.headers;
    const finalBody = bodyField?.value || values.body;

    console.error('Final headers value:', finalHeaders);
    console.error('Final body value:', finalBody);

    const entity = {
      ...httpMonitorEntity,
      ...values,
      headers: finalHeaders ? JSON.parse(finalHeaders) : null,
      body: finalBody ? JSON.parse(finalBody) : null,
      schedule: schedules.find(it => it.id.toString() === values.schedule?.toString()),
    };

    console.error('Final entity to save:', entity);

    if (isNew) {
      dispatch(createEntity(entity));
    } else {
      dispatch(updateEntity(entity));
    }
  };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="uptimeOApp.apiMonitor.home.createOrEditLabel" data-cy="HttpMonitorCreateUpdateHeading">
            Create or edit a HTTP Monitor
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm key={formKey} defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="http-monitor-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField
                label="Name"
                id="http-monitor-name"
                name="name"
                data-cy="name"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                  minLength: { value: 1, message: 'This field is required to be at least 1 characters.' },
                  maxLength: { value: 100, message: 'This field cannot be longer than 100 characters.' },
                }}
              />
              <ValidatedField
                label="Method"
                id="http-monitor-method"
                name="method"
                data-cy="method"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                  minLength: { value: 1, message: 'This field is required to be at least 1 characters.' },
                  maxLength: { value: 10, message: 'This field cannot be longer than 10 characters.' },
                }}
              />
              <ValidatedField
                label="Type"
                id="http-monitor-type"
                name="type"
                data-cy="type"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                  minLength: { value: 1, message: 'This field is required to be at least 1 characters.' },
                  maxLength: { value: 10, message: 'This field cannot be longer than 10 characters.' },
                }}
              />
              <ValidatedField
                label="Url"
                id="http-monitor-url"
                name="url"
                data-cy="url"
                type="textarea"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <div className="mb-3">
                <ValidatedField
                  label="Headers (JSON)"
                  id="http-monitor-headers"
                  name="headers"
                  data-cy="headers"
                  type="textarea"
                  placeholder='{"Content-Type": "application/json"}'
                  validate={{ validate: validateJson }}
                />
              </div>
              <div className="mb-3">
                <ValidatedField
                  label="Body (JSON)"
                  id="http-monitor-body"
                  name="body"
                  data-cy="body"
                  type="textarea"
                  placeholder='{"key": "value"}'
                  validate={{ validate: validateJson }}
                />
              </div>
              <ValidatedField id="http-monitor-schedule" name="schedule" data-cy="schedule" label="Schedule" type="select">
                <option value="" key="0" />
                {schedules
                  ? schedules.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/http-monitor" replace color="info">
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

export default HttpMonitorUpdate;
