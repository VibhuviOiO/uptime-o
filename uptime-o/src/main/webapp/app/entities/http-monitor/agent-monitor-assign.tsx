import React, { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader, Button, Spinner, Alert, FormGroup, Label, Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';

interface IAgent {
  id: number;
  name: string;
  datacenter?: {
    id: number;
    name: string;
  };
}

interface IAgentMonitorAssignProps {
  isOpen: boolean;
  toggle: () => void;
  monitorId: number;
  monitorName: string;
  onSave: () => void;
}

export const AgentMonitorAssign: React.FC<IAgentMonitorAssignProps> = ({ isOpen, toggle, monitorId, monitorName, onSave }) => {
  const [agents, setAgents] = useState<IAgent[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedAgents(new Set());
      fetchAgentsAndAssignments();
    }
  }, [isOpen, monitorId]);

  const fetchAgentsAndAssignments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all agents
      const agentsResponse = await axios.get<any>('/api/agents?size=1000');
      const agentData = Array.isArray(agentsResponse.data) ? agentsResponse.data : agentsResponse.data.content || [];
      setAgents(agentData);

      // Fetch current assignments for this monitor
      const assignmentsResponse = await axios.get<any>(`/api/agent-monitors/by-monitor/${monitorId}`);
      const assignments = Array.isArray(assignmentsResponse.data) ? assignmentsResponse.data : [];

      // Build set of assigned agent IDs
      const assigned = new Set<number>(assignments.map((a: any) => a.agentId).filter((id: any) => id));
      setSelectedAgents(assigned);
    } catch (err) {
      setError('Failed to load agents. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAgent = (agentId: number) => {
    const newSelected = new Set(selectedAgents);
    if (newSelected.has(agentId)) {
      newSelected.delete(agentId);
    } else {
      newSelected.add(agentId);
    }
    setSelectedAgents(newSelected);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Fetch current assignments
      const currentResponse = await axios.get<any>(`/api/agent-monitors/by-monitor/${monitorId}`);
      const currentAssignments = Array.isArray(currentResponse.data) ? currentResponse.data : [];

      // Find assignments to delete (currently assigned but not selected)
      const currentAgentIds = new Set(currentAssignments.map((a: any) => a.agentId));
      const assignmentsToDelete = currentAssignments.filter((a: any) => !selectedAgents.has(a.agentId));

      // Find new assignments to create (selected but not currently assigned)
      const newAgentIds = Array.from(selectedAgents).filter(agentId => !currentAgentIds.has(agentId));

      // Execute deletions
      for (const assignment of assignmentsToDelete) {
        await axios.delete(`/api/agent-monitors/${assignment.id}`);
      }

      // Execute creations
      for (const agentId of newAgentIds) {
        await axios.post('/api/agent-monitors', {
          agentId,
          monitorId,
          active: true,
        });
      }

      onSave();
      toggle();
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to save assignments. Please try again.');
      }
      console.error('Error saving assignments:', err);
    } finally {
      setSaving(false);
    }
  };

  const groupedAgents = agents.reduce(
    (acc, agent) => {
      const dcName = agent.datacenter?.name || 'Unassigned';
      if (!acc[dcName]) {
        acc[dcName] = [];
      }
      acc[dcName].push(agent);
      return acc;
    },
    {} as Record<string, IAgent[]>,
  );

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        <FontAwesomeIcon icon="users" /> Assign Agents to Monitor: {monitorName}
      </ModalHeader>
      <ModalBody>
        {loading && (
          <div className="text-center p-4">
            <Spinner color="primary" />
            <p className="mt-2">Loading agents...</p>
          </div>
        )}

        {error && (
          <Alert color="danger" className="mb-3">
            <FontAwesomeIcon icon="exclamation-triangle" /> {error}
          </Alert>
        )}

        {!loading && !error && (
          <>
            <p className="text-muted mb-3">
              Select agents that should monitor this HTTP endpoint. Multiple agents can monitor the same endpoint from different locations.
            </p>

            {Object.keys(groupedAgents).length === 0 && (
              <Alert color="info">
                <FontAwesomeIcon icon="info-circle" /> No agents available. Please create agents first.
              </Alert>
            )}

            {Object.entries(groupedAgents).map(([datacenterName, dcAgents]) => (
              <div key={datacenterName} className="mb-4">
                <h6 className="text-muted mb-2">
                  <FontAwesomeIcon icon="server" className="me-2" />
                  {datacenterName}
                </h6>
                <div className="border rounded p-3">
                  {dcAgents.map(agent => (
                    <FormGroup check key={agent.id} className="mb-2">
                      <Label check>
                        <Input
                          type="checkbox"
                          checked={selectedAgents.has(agent.id)}
                          onChange={() => toggleAgent(agent.id)}
                          disabled={saving}
                        />
                        <span className="ms-2">{agent.name}</span>
                      </Label>
                    </FormGroup>
                  ))}
                </div>
              </div>
            ))}

            <div className="alert alert-info mt-3">
              <small>
                <FontAwesomeIcon icon="info-circle" className="me-2" />
                <strong>Selected: {selectedAgents.size}</strong> {selectedAgents.size === 1 ? 'agent' : 'agents'}
              </small>
            </div>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle} disabled={saving}>
          <FontAwesomeIcon icon="times" /> Cancel
        </Button>
        <Button color="primary" onClick={handleSave} disabled={loading || saving}>
          {saving ? (
            <>
              <Spinner size="sm" className="me-2" />
              Saving...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon="save" /> Save Assignments
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AgentMonitorAssign;
