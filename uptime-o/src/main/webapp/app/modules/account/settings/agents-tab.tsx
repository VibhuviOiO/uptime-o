import React, { useEffect, useState } from 'react';
import { Button, Table, Spinner, Collapse, Card, CardBody, Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash, faRobot, faPlus, faPlay, faChevronDown, faChevronUp, faCopy } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AgentEditModal } from 'app/modules/home/components/AgentEditModal';
import AgentDeleteModal from 'app/modules/home/components/AgentDeleteModal';

interface IRegion {
  id?: number;
  name?: string;
}

interface IAgent {
  id?: number;
  name?: string;
  agentCode?: string;
  regionId?: number;
  region?: IRegion;
}

export const AgentsTab = () => {
  const [agents, setAgents] = useState<IAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [expandedAgentId, setExpandedAgentId] = useState<number | null>(null);

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

  const toggleInstructions = (agentId: number) => {
    setExpandedAgentId(expandedAgentId === agentId ? null : agentId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getDockerCommand = (agent: IAgent) => {
    const apiBaseUrl = window.location.origin;
    return `docker run -d \\
  --name agent-${agent.agentCode} \\
  --network host \\
  -e AGENT_ID="${agent.id}" \\
  -e API_BASE_URL="${apiBaseUrl}" \\
  -e API_KEY="your_api_key_here" \\
  -v "$(pwd)/data/agent-${agent.agentCode}:/data" \\
  --restart unless-stopped \\
  ghcr.io/vibhuvioio/uptimeo-agent:latest`;
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
              <th>Region</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent, i) => (
              <React.Fragment key={`entity-${i}`}>
                <tr>
                  <td>{agent.name}</td>
                  <td>{agent.region?.name || '-'}</td>
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
                      style={{ padding: 0, marginRight: '0.5rem', color: '#dc3545' }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                    <Button color="success" size="sm" onClick={() => toggleInstructions(agent.id)}>
                      <FontAwesomeIcon icon={faPlay} className="me-1" />
                      Run Agent
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} style={{ padding: 0, border: 'none' }}>
                    <Collapse isOpen={expandedAgentId === agent.id}>
                      <Card style={{ margin: '0.5rem', border: '1px solid #dee2e6' }}>
                        <CardBody>
                          <h6 className="mb-3">
                            <FontAwesomeIcon icon={faPlay} className="me-2" />
                            Run Agent: {agent.name}
                          </h6>
                          <div className="alert alert-warning mb-3" style={{ fontSize: '0.85rem' }}>
                            <strong>⚠️ Important:</strong>
                            <ul className="mb-0 mt-2" style={{ paddingLeft: '1.2rem' }}>
                              <li>
                                <strong>API_BASE_URL:</strong> Update this to match your application URL (currently set to{' '}
                                <code>{window.location.origin}</code>)
                              </li>
                              <li>
                                <strong>AGENT_ID:</strong> Do NOT change this ID. Each agent must have a unique ID to prevent duplicate
                                monitoring
                              </li>
                              <li>
                                <strong>API_KEY:</strong> Create an API key from the API Keys tab or get one from your admin
                              </li>
                            </ul>
                          </div>
                          <p className="text-muted small mb-2">Copy and run this command on your target machine:</p>
                          <div className="position-relative">
                            <Input
                              type="textarea"
                              value={getDockerCommand(agent)}
                              readOnly
                              rows={9}
                              style={{ fontFamily: 'monospace', fontSize: '0.85rem', backgroundColor: '#f8f9fa' }}
                            />
                            <Button
                              color="secondary"
                              size="sm"
                              onClick={() => copyToClipboard(getDockerCommand(agent))}
                              style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}
                            >
                              <FontAwesomeIcon icon={faCopy} className="me-1" />
                              Copy
                            </Button>
                          </div>
                        </CardBody>
                      </Card>
                    </Collapse>
                  </td>
                </tr>
              </React.Fragment>
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
