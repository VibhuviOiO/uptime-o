import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntities as getSchedules } from 'app/entities/schedule/schedule.reducer';
import { createEntity, getEntity, reset, updateEntity } from './api-monitor.reducer';

export const ApiMonitorUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const schedules = useAppSelector(state => state.schedule.entities);
  const apiMonitorEntity = useAppSelector(state => state.apiMonitor.entity);
  const loading = useAppSelector(state => state.apiMonitor.loading);
  const updating = useAppSelector(state => state.apiMonitor.updating);
  const updateSuccess = useAppSelector(state => state.apiMonitor.updateSuccess);

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

    const entity = {
      ...apiMonitorEntity,
      ...values,
      schedule: schedules.find(it => it.id.toString() === values.schedule?.toString()),
    };

    if (isNew) {
      dispatch(createEntity(entity));
    } else {
      dispatch(updateEntity(entity));
    }
  };

  const defaultValues = () =>
    isNew
      ? {}
      : {
          ...apiMonitorEntity,
          schedule: apiMonitorEntity?.schedule?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="uptimeOApp.apiMonitor.home.createOrEditLabel" data-cy="ApiMonitorCreateUpdateHeading">
            Create or edit a Api Monitor
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="api-monitor-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField
                label="Name"
                id="api-monitor-name"
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
                id="api-monitor-method"
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
                id="api-monitor-type"
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
                id="api-monitor-url"
                name="url"
                data-cy="url"
                type="textarea"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField label="Headers" id="api-monitor-headers" name="headers" data-cy="headers" type="textarea" />
              <ValidatedField label="Body" id="api-monitor-body" name="body" data-cy="body" type="textarea" />
              <ValidatedField id="api-monitor-schedule" name="schedule" data-cy="schedule" label="Schedule" type="select">
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

export default ApiMonitorUpdate;
