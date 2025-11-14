import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntity, updateEntity, createEntity, reset } from './instance.reducer';
import axios from 'axios';

export const InstanceUpdate = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const instanceEntity = useAppSelector(state => state.instance.entity);
  const loading = useAppSelector(state => state.instance.loading);
  const updating = useAppSelector(state => state.instance.updating);
  const updateSuccess = useAppSelector(state => state.instance.updateSuccess);

  const [datacenters, setDatacenters] = useState([]);

  useEffect(() => {
    axios.get('/api/datacenters?size=1000').then(response => {
      setDatacenters(response.data);
    });
  }, []);

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
    const entity = {
      ...instanceEntity,
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
      ? {
          pingEnabled: true,
          pingInterval: 30,
          pingTimeoutMs: 3000,
          pingRetryCount: 2,
          hardwareMonitoringEnabled: false,
          hardwareMonitoringInterval: 300,
          cpuWarningThreshold: 70,
          cpuDangerThreshold: 90,
          memoryWarningThreshold: 75,
          memoryDangerThreshold: 90,
          diskWarningThreshold: 80,
          diskDangerThreshold: 95,
        }
      : {
          instanceType: 'VM',
          monitoringType: 'SELF_HOSTED',
          ...instanceEntity,
        };

  const handleClose = () => {
    navigate('/instance');
  };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2>{isNew ? 'Create' : 'Edit'} Instance</h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew && <ValidatedField name="id" required readOnly id="instance-id" label="ID" validate={{ required: true }} />}
              <ValidatedField label="Name" id="instance-name" name="name" type="text" validate={{ required: true }} />
              <ValidatedField label="Hostname" id="instance-hostname" name="hostname" type="text" validate={{ required: true }} />
              <ValidatedField label="Description" id="instance-description" name="description" type="text" />
              <ValidatedField label="Instance Type" id="instance-type" name="instanceType" type="select">
                <option value="VM">VM</option>
                <option value="BARE_METAL">Bare Metal</option>
                <option value="CONTAINER">Container</option>
                <option value="CLOUD_INSTANCE">Cloud Instance</option>
              </ValidatedField>
              <ValidatedField label="Monitoring Type" id="instance-monitoring-type" name="monitoringType" type="select">
                <option value="SELF_HOSTED">Self Hosted</option>
                <option value="AGENT_MONITORED">Agent Monitored</option>
              </ValidatedField>
              <ValidatedField label="Operating System" id="instance-os" name="operatingSystem" type="text" />
              <ValidatedField label="Platform" id="instance-platform" name="platform" type="text" />
              <ValidatedField label="Private IP" id="instance-private-ip" name="privateIpAddress" type="text" />
              <ValidatedField label="Public IP" id="instance-public-ip" name="publicIpAddress" type="text" />
              <ValidatedField label="Datacenter" id="instance-datacenter" name="datacenterId" type="select" validate={{ required: true }}>
                <option value="" key="0" />
                {datacenters.map(dc => (
                  <option value={dc.id} key={dc.id}>
                    {dc.name}
                  </option>
                ))}
              </ValidatedField>
              <ValidatedField label="Ping Enabled" id="instance-ping-enabled" name="pingEnabled" type="checkbox" />
              <ValidatedField label="Ping Interval (s)" id="instance-ping-interval" name="pingInterval" type="number" />
              <ValidatedField label="Hardware Monitoring" id="instance-hw-enabled" name="hardwareMonitoringEnabled" type="checkbox" />
              <Button tag={Link} to="/instance" replace color="info">
                <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
              </Button>
              &nbsp;
              <Button color="primary" type="submit" disabled={updating}>
                <FontAwesomeIcon icon="save" /> Save
              </Button>
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default InstanceUpdate;
