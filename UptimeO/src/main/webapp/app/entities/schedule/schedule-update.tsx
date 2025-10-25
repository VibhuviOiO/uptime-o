import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { ValidatedField, ValidatedForm, isNumber } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { createEntity, getEntity, reset, updateEntity } from './schedule.reducer';

export const ScheduleUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const scheduleEntity = useAppSelector(state => state.schedule.entity);
  const loading = useAppSelector(state => state.schedule.loading);
  const updating = useAppSelector(state => state.schedule.updating);
  const updateSuccess = useAppSelector(state => state.schedule.updateSuccess);

  const handleClose = () => {
    navigate(`/schedule${location.search}`);
  };

  useEffect(() => {
    if (isNew) {
      dispatch(reset());
    } else {
      dispatch(getEntity(id));
    }
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
    if (values.interval !== undefined && typeof values.interval !== 'number') {
      values.interval = Number(values.interval);
    }
    if (values.thresholdsWarning !== undefined && typeof values.thresholdsWarning !== 'number') {
      values.thresholdsWarning = Number(values.thresholdsWarning);
    }
    if (values.thresholdsCritical !== undefined && typeof values.thresholdsCritical !== 'number') {
      values.thresholdsCritical = Number(values.thresholdsCritical);
    }

    const entity = {
      ...scheduleEntity,
      ...values,
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
          ...scheduleEntity,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="uptimeOApp.schedule.home.createOrEditLabel" data-cy="ScheduleCreateUpdateHeading">
            Create or edit a Schedule
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="schedule-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField
                label="Name"
                id="schedule-name"
                name="name"
                data-cy="name"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                  minLength: { value: 1, message: 'This field is required to be at least 1 characters.' },
                  maxLength: { value: 50, message: 'This field cannot be longer than 50 characters.' },
                }}
              />
              <ValidatedField
                label="Interval"
                id="schedule-interval"
                name="interval"
                data-cy="interval"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                  min: { value: 1, message: 'This field should be at least 1.' },
                  validate: v => isNumber(v) || 'This field should be a number.',
                }}
              />
              <ValidatedField
                label="Include Response Body"
                id="schedule-includeResponseBody"
                name="includeResponseBody"
                data-cy="includeResponseBody"
                check
                type="checkbox"
              />
              <ValidatedField
                label="Thresholds Warning"
                id="schedule-thresholdsWarning"
                name="thresholdsWarning"
                data-cy="thresholdsWarning"
                type="text"
              />
              <ValidatedField
                label="Thresholds Critical"
                id="schedule-thresholdsCritical"
                name="thresholdsCritical"
                data-cy="thresholdsCritical"
                type="text"
              />
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/schedule" replace color="info">
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

export default ScheduleUpdate;
