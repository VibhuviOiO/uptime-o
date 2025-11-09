import React, { useEffect, useState } from 'react';
import { Button, Table, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash, faRobot, faPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AgentEditModal } from 'app/modules/home/components/AgentEditModal';
import AgentDeleteModal from 'app/modules/home/components/AgentDeleteModal';

interface IDatacenter {
  id?: number;
  name?: string;
}

interface IAgent {
  id?: number;
  name?: string;
  agentCode?: string;
  datacenterId?: number;
  datacenter?: IDatacenter;
}

export const AgentsTab = () => {
  const [agents, setAgents] = useState<IAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const response = await axios.get<IAgent[]>('/api/agents?page=0&size=1000&sort=id,desc');
      setAgents(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load agents');
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedAgentId(null);
    setEditModalOpen(true);
  };

  const handleEditClick = (agentId: number) => {
    setSelectedAgentId(agentId);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (agentId: number) => {
    setSelectedAgentId(agentId);
    setDeleteModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedAgentId(null);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedAgentId(null);
  };

  const handleEditSuccess = () => {
    loadAgents();
  };

  const handleDeleteSuccess = () => {
    loadAgents();
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner color="primary" />
        <p className="mt-2">Loading agents...</p>
      </div>
    );
  }

  return (
    <div className="tab-content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>
          <FontAwesomeIcon icon={faRobot} className="me-2" />
          Agents
        </h5>
        <Button color="primary" size="sm" onClick={handleCreateClick}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          New Agent
        </Button>
      </div>

      {!agents || agents.length === 0 ? (
        <div className="alert alert-info">
          <p>No agents found. Create one to get started.</p>
        </div>
      ) : (
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Datacenter</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent, i) => (
              <tr key={`entity-${i}`}>
                <td>{agent.name}</td>
                <td>{agent.datacenter?.name || '-'}</td>
                <td>
                  <Button
                    color="link"
                    size="sm"
                    onClick={() => handleEditClick(agent.id)}
                    title="Edit"
                    style={{ padding: 0, marginRight: '0.5rem' }}
                  >
                    <FontAwesomeIcon icon={faPencil} />
                  </Button>
                  <Button
                    color="link"
                    size="sm"
                    onClick={() => handleDeleteClick(agent.id)}
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

      <AgentEditModal isOpen={editModalOpen} toggle={handleCloseEditModal} agentId={selectedAgentId} onSave={handleEditSuccess} />
      <AgentDeleteModal isOpen={deleteModalOpen} toggle={handleCloseDeleteModal} agentId={selectedAgentId} onDelete={handleDeleteSuccess} />
    </div>
  );
};

export default AgentsTab;
