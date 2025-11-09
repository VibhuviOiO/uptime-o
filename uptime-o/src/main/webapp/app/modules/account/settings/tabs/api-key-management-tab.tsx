import React, { useState, useEffect } from 'react';
import { Button, Table, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Alert } from 'reactstrap';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSync, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

interface IApiKey {
  id?: number;
  name?: string;
  description?: string;
  active?: boolean;
  lastUsedDate?: Date;
  expiresAt?: Date;
  createdBy?: string;
  createdDate?: Date;
  plainTextKey?: string;
}

export const ApiKeyManagementTab = () => {
  const [apiKeys, setApiKeys] = useState<IApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState<IApiKey | null>(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    expiresAt: '',
  });

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    setLoading(true);
    try {
      const response = await axios.get<IApiKey[]>('api/admin/api-keys');
      setApiKeys(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load API keys');
      setLoading(false);
    }
  };

  const handleSyncList = () => {
    loadApiKeys();
  };

  const openCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      expiresAt: '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert datetime-local format to ISO-8601 format
      const payload = {
        name: formData.name,
        description: formData.description,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      };
      const response = await axios.post<IApiKey>('api/admin/api-keys', payload);
      toast.success('API Key created successfully');
      setNewApiKey(response.data);
      setShowKeyModal(true);
      closeModal();
      loadApiKeys();
    } catch (error) {
      toast.error('Failed to create API key');
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      await axios.put(`api/admin/api-keys/${id}/deactivate`);
      toast.success('API Key deactivated successfully');
      loadApiKeys();
    } catch (error) {
      toast.error('Failed to deactivate API key');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      try {
        await axios.delete(`api/admin/api-keys/${id}`);
        toast.success('API Key deleted successfully');
        loadApiKeys();
      } catch (error) {
        toast.error('Failed to delete API key');
      }
    }
  };

  const copyToClipboard = () => {
    if (newApiKey?.plainTextKey) {
      navigator.clipboard.writeText(newApiKey.plainTextKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="tab-content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3>API Key Management</h3>
          <p className="tab-description">Manage API keys for agent authentication.</p>
        </div>
        <div className="d-flex gap-2">
          <Button color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon={faSync} spin={loading} /> Refresh
          </Button>
          <Button color="primary" onClick={openCreateModal}>
            <FontAwesomeIcon icon={faPlus} /> Create API Key
          </Button>
        </div>
      </div>

      {loading ? (
        <p>Loading API keys...</p>
      ) : apiKeys.length === 0 ? (
        <div className="text-center py-5">
          <FontAwesomeIcon icon="key" size="3x" className="text-muted mb-3" />
          <h5 className="text-muted">No API Keys Available</h5>
          <p className="text-muted mb-4">You haven&apos;t created any API keys yet. Create your first API key to get started.</p>
          <Button color="primary" onClick={openCreateModal}>
            <FontAwesomeIcon icon={faPlus} /> Create Your First API Key
          </Button>
        </div>
      ) : (
        <div className="table-responsive">
          <Table hover striped>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Created Date</th>
                <th>Last Used</th>
                <th>Expires At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map(apiKey => (
                <tr key={apiKey.id}>
                  <td>
                    <strong>{apiKey.name}</strong>
                  </td>
                  <td>{apiKey.description}</td>
                  <td>
                    <Badge color={apiKey.active ? 'success' : 'secondary'}>{apiKey.active ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td>{apiKey.createdBy}</td>
                  <td>{apiKey.createdDate ? new Date(apiKey.createdDate).toLocaleString() : ''}</td>
                  <td>{apiKey.lastUsedDate ? new Date(apiKey.lastUsedDate).toLocaleString() : 'Never'}</td>
                  <td>{apiKey.expiresAt ? new Date(apiKey.expiresAt).toLocaleString() : 'Never'}</td>
                  <td>
                    <div className="d-flex gap-3">
                      {apiKey.active && apiKey.id && (
                        <a
                          onClick={() => handleDeactivate(apiKey.id)}
                          title="Deactivate"
                          className="text-warning"
                          style={{ cursor: 'pointer' }}
                        >
                          <FontAwesomeIcon icon="ban" />
                        </a>
                      )}
                      {apiKey.id && (
                        <a onClick={() => handleDelete(apiKey.id)} title="Delete" className="text-danger" style={{ cursor: 'pointer' }}>
                          <FontAwesomeIcon icon="trash" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Create API Key Modal */}
      <Modal isOpen={modalOpen} toggle={closeModal} size="lg">
        <ModalHeader toggle={closeModal}>Create New API Key</ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <FormGroup>
              <Label for="name">Name *</Label>
              <Input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} required />
            </FormGroup>

            <FormGroup>
              <Label for="description">Description</Label>
              <Input id="description" name="description" type="text" value={formData.description} onChange={handleInputChange} />
            </FormGroup>

            <FormGroup>
              <Label for="expiresAt">Expires At (Optional)</Label>
              <Input id="expiresAt" name="expiresAt" type="datetime-local" value={formData.expiresAt} onChange={handleInputChange} />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button color="primary" type="submit">
              Create
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* Show API Key Modal (One-time view) */}
      <Modal isOpen={showKeyModal} toggle={() => setShowKeyModal(false)} size="lg">
        <ModalHeader toggle={() => setShowKeyModal(false)}>API Key Created Successfully</ModalHeader>
        <ModalBody>
          <Alert color="warning">
            <strong>Important!</strong> This is the only time you will see this API key. Please copy it now and store it securely.
          </Alert>

          <FormGroup>
            <Label>API Key</Label>
            <div className="input-group">
              <Input type="text" value={newApiKey?.plainTextKey || ''} readOnly className="font-monospace" />
              <Button color="primary" onClick={copyToClipboard}>
                <FontAwesomeIcon icon={copied ? faCheck : faCopy} /> {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </FormGroup>

          <div className="mt-3">
            <strong>API Key Details:</strong>
            <ul>
              <li>Name: {newApiKey?.name}</li>
              <li>Description: {newApiKey?.description || 'N/A'}</li>
              <li>Created: {newApiKey?.createdDate ? new Date(newApiKey.createdDate).toLocaleString() : ''}</li>
            </ul>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => setShowKeyModal(false)}>
            I have saved the API key
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ApiKeyManagementTab;
