import React, { useEffect, useState } from 'react';
import { Button, Table, Spinner, Badge } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash, faServer, faPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import InstanceEditModal from 'app/modules/home/components/InstanceEditModal';
import InstanceDeleteModal from 'app/modules/home/components/InstanceDeleteModal';

interface IInstance {
  id?: number;
  name?: string;
  hostname?: string;
  description?: string;
  instanceType?: string;
  monitoringType?: string;
  operatingSystem?: string;
  platform?: string;
  privateIpAddress?: string;
  publicIpAddress?: string;
  pingEnabled?: boolean;
  pingInterval?: number;
  pingTimeoutMs?: number;
  pingRetryCount?: number;
  hardwareMonitoringEnabled?: boolean;
  hardwareMonitoringInterval?: number;
  cpuWarningThreshold?: number;
  cpuDangerThreshold?: number;
  memoryWarningThreshold?: number;
  memoryDangerThreshold?: number;
  diskWarningThreshold?: number;
  diskDangerThreshold?: number;
  datacenterName?: string;
}

export const InstancesTab = () => {
  const [instances, setInstances] = useState<IInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | null>(null);

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    setLoading(true);
    try {
      const response = await axios.get<IInstance[]>('/api/instances?page=0&size=1000&sort=id,desc');
      setInstances(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load instances');
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedInstanceId(null);
    setModalOpen(true);
  };

  const handleEditClick = (instanceId: number) => {
    setSelectedInstanceId(instanceId);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedInstanceId(null);
  };

  const handleDeleteClick = (instanceId: number) => {
    setSelectedInstanceId(instanceId);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedInstanceId(null);
  };

  const handleSaveSuccess = () => {
    loadInstances();
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner color="primary" />
        <p className="mt-2">Loading instances...</p>
      </div>
    );
  }

  return (
    <div className="tab-content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>
          <FontAwesomeIcon icon={faServer} className="me-2" />
          Instances
        </h5>
        <Button color="primary" size="sm" onClick={handleCreateClick}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          New Instance
        </Button>
      </div>

      {!instances || instances.length === 0 ? (
        <div className="alert alert-info">
          <p>No instances found. Create one to get started.</p>
        </div>
      ) : (
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Hostname</th>
              <th>Type</th>
              <th>OS/Platform</th>
              <th>IP Address</th>
              <th>Monitoring Type</th>
              <th>Checks</th>
              <th>Datacenter</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {instances.map((instance, i) => (
              <tr key={`entity-${i}`}>
                <td>
                  <strong>{instance.name}</strong>
                  {instance.description && (
                    <>
                      <br />
                      <small className="text-muted">{instance.description}</small>
                    </>
                  )}
                </td>
                <td>
                  <code>{instance.hostname}</code>
                </td>
                <td>
                  <Badge color="info">{instance.instanceType}</Badge>
                </td>
                <td>
                  {instance.operatingSystem && <div>{instance.operatingSystem}</div>}
                  {instance.platform && <small className="text-muted">{instance.platform}</small>}
                  {!instance.operatingSystem && !instance.platform && '-'}
                </td>
                <td>
                  {instance.privateIpAddress && (
                    <div>
                      <code>{instance.privateIpAddress}</code>
                    </div>
                  )}
                  {instance.publicIpAddress && <small className="text-muted">{instance.publicIpAddress}</small>}
                  {!instance.privateIpAddress && !instance.publicIpAddress && '-'}
                </td>
                <td>
                  <Badge color={instance.monitoringType === 'SELF_HOSTED' ? 'secondary' : 'warning'}>
                    {instance.monitoringType === 'SELF_HOSTED' ? 'Self Hosted' : 'Agent Monitored'}
                  </Badge>
                </td>
                <td>
                  <div>
                    {instance.pingEnabled && (
                      <Badge
                        color="success"
                        className="me-1"
                        title={`Interval: ${instance.pingInterval}s, Timeout: ${instance.pingTimeoutMs}ms, Retry: ${instance.pingRetryCount}`}
                      >
                        Ping
                      </Badge>
                    )}
                    {instance.hardwareMonitoringEnabled && (
                      <Badge
                        color="primary"
                        title={`Interval: ${instance.hardwareMonitoringInterval}s, CPU: ${instance.cpuWarningThreshold}%/${instance.cpuDangerThreshold}%, Memory: ${instance.memoryWarningThreshold}%/${instance.memoryDangerThreshold}%, Disk: ${instance.diskWarningThreshold}%/${instance.diskDangerThreshold}%`}
                      >
                        Hardware
                      </Badge>
                    )}
                  </div>
                </td>
                <td>{instance.datacenterName || '-'}</td>
                <td>
                  <Button
                    color="link"
                    size="sm"
                    onClick={() => handleEditClick(instance.id)}
                    title="Edit"
                    style={{ padding: 0, marginRight: '0.5rem' }}
                  >
                    <FontAwesomeIcon icon={faPencil} />
                  </Button>
                  <Button
                    color="link"
                    size="sm"
                    onClick={() => handleDeleteClick(instance.id)}
                    title="Delete"
                    style={{ padding: 0, color: '#dc3545' }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <InstanceEditModal isOpen={modalOpen} toggle={handleCloseModal} instanceId={selectedInstanceId} onSave={handleSaveSuccess} />
      <InstanceDeleteModal
        isOpen={deleteModalOpen}
        toggle={handleCloseDeleteModal}
        instanceId={selectedInstanceId}
        onDelete={handleSaveSuccess}
      />
    </div>
  );
};

export default InstancesTab;
