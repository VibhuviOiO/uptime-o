import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntities as getDatacenters } from 'app/entities/datacenter/datacenter.reducer';
import { getEntities as getHttpMonitors } from 'app/entities/http-monitor/http-monitor.reducer';
import { createEntity, getEntity, reset, updateEntity } from './datacenter-monitor.reducer';

export const DatacenterMonitorUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const datacenters = useAppSelector(state => state.datacenter.entities);
  const httpMonitors = useAppSelector(state => state.httpMonitor.entities);
  const datacenterMonitorEntity = useAppSelector(state => state.datacenterMonitor.entity);
  const loading = useAppSelector(state => state.datacenterMonitor.loading);
  const updating = useAppSelector(state => state.datacenterMonitor.updating);
  const updateSuccess = useAppSelector(state => state.datacenterMonitor.updateSuccess);

  const handleClose = () => {
    navigate('/datacenter-monitor');
  };

  useEffect(() => {
    if (isNew) {
      dispatch(reset());
    } else {
      dispatch(getEntity(id));
    }

    dispatch(getDatacenters({}));
    dispatch(getHttpMonitors({}));
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
      ...datacenterMonitorEntity,
      ...values,
      datacenter: datacenters.find(it => it.id.toString() === values.datacenter?.toString()),
      monitor: httpMonitors.find(it => it.id.toString() === values.monitor?.toString()),
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
          ...datacenterMonitorEntity,
          datacenter: datacenterMonitorEntity?.datacenter?.id,
          monitor: datacenterMonitorEntity?.monitor?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="uptimeOApp.datacenterMonitor.home.createOrEditLabel" data-cy="DatacenterMonitorCreateUpdateHeading">
            Create or edit a Datacenter Monitor
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
                <ValidatedField name="id" required readOnly id="datacenter-monitor-id" label="ID" validate={{ required: true }} />
              ) : null}
              <ValidatedField id="datacenter-monitor-datacenter" name="datacenter" data-cy="datacenter" label="Datacenter" type="select">
                <option value="" key="0" />
                {datacenters
                  ? datacenters.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <ValidatedField id="datacenter-monitor-monitor" name="monitor" data-cy="monitor" label="Monitor" type="select">
                <option value="" key="0" />
                {httpMonitors
                  ? httpMonitors.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/datacenter-monitor" replace color="info">
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

export default DatacenterMonitorUpdate;
