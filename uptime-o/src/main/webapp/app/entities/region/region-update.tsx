import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { createEntity, getEntity, reset, updateEntity } from './region.reducer';

export const RegionUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const regionEntity = useAppSelector(state => state.region.entity);
  const loading = useAppSelector(state => state.region.loading);
  const updating = useAppSelector(state => state.region.updating);
  const updateSuccess = useAppSelector(state => state.region.updateSuccess);

  const handleClose = () => {
    navigate(`/region${location.search}`);
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

    const entity = {
      ...regionEntity,
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
          ...regionEntity,
        };

  return (
    <div className="region-update-card-page">
      <Row className="justify-content-center">
        <Col lg="6" md="8" sm="10">
          <div className="region-form-card">
            <h2 id="uptimeOApp.region.home.createOrEditLabel" data-cy="RegionCreateUpdateHeading" className="card-title">
              {isNew ? 'Create Region' : 'Edit Region'}
            </h2>
            {loading ? (
              <p className="loading-text">Loading...</p>
            ) : (
              <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
                {!isNew && <ValidatedField name="id" required readOnly id="region-id" label="ID" validate={{ required: true }} />}
                <ValidatedField
                  label="Name"
                  id="region-name"
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
                  label="Region Code"
                  id="region-regionCode"
                  name="regionCode"
                  data-cy="regionCode"
                  type="text"
                  validate={{
                    maxLength: { value: 20, message: 'This field cannot be longer than 20 characters.' },
                  }}
                />
                <ValidatedField
                  label="Group Name"
                  id="region-groupName"
                  name="groupName"
                  data-cy="groupName"
                  type="text"
                  validate={{
                    maxLength: { value: 20, message: 'This field cannot be longer than 20 characters.' },
                  }}
                />
                <div className="card-actions">
                  <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/region" replace color="secondary" outline>
                    <FontAwesomeIcon icon="arrow-left" />
                    &nbsp; Back
                  </Button>
                  <Button color="primary" id="save-entity" data-cy="entityCreateSaveButton" type="submit" disabled={updating}>
                    <FontAwesomeIcon icon="save" />
                    &nbsp; Save
                  </Button>
                </div>
              </ValidatedForm>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default RegionUpdate;
