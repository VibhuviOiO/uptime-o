import React, { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader, Button, Spinner, Alert, FormGroup, Label, Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';

interface IDatacenter {
  id: number;
  name: string;
  code: string;
}

interface IDatacenterMonitorAssignProps {
  isOpen: boolean;
  toggle: () => void;
  monitorId: number;
  monitorName: string;
  onSave: () => void;
}

export const DatacenterMonitorAssign: React.FC<IDatacenterMonitorAssignProps> = ({ isOpen, toggle, monitorId, monitorName, onSave }) => {
  const [datacenters, setDatacenters] = useState<IDatacenter[]>([]);
  const [selectedDatacenters, setSelectedDatacenters] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Clear previous selections when opening for a new monitor
      setSelectedDatacenters(new Set());
      fetchDatacentersAndAssignments();
    }
  }, [isOpen, monitorId]);

  const fetchDatacentersAndAssignments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all datacenters
      const datacentersResponse = await axios.get<any>('/api/datacenters?size=1000');
      const dcData = Array.isArray(datacentersResponse.data) ? datacentersResponse.data : datacentersResponse.data.content || [];
      setDatacenters(dcData);

      // Fetch current assignments for this monitor - try different query approaches
      let assignmentsResponse;
      try {
        // First try with filter parameter
        assignmentsResponse = await axios.get<any>(`/api/datacenter-monitors?size=1000&filter=monitor.id=${monitorId}`);
      } catch {
        // Fallback: fetch all and filter client-side
        assignmentsResponse = await axios.get<any>('/api/datacenter-monitors?size=1000');
      }

      const allAssignments = Array.isArray(assignmentsResponse.data) ? assignmentsResponse.data : assignmentsResponse.data.content || [];

      // Filter assignments for the current monitor if not already filtered by backend
      const assignments = allAssignments.filter((a: any) => a.httpMonitor?.id === monitorId || a.monitor?.id === monitorId);

      // Build set of assigned datacenter IDs
      const assigned = new Set<number>(assignments.map((a: any) => a.datacenter?.id).filter((id: any) => id));
      setSelectedDatacenters(assigned);
    } catch (err) {
      setError('Failed to load datacenters. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDatacenter = (datacenterId: number) => {
    const newSelected = new Set(selectedDatacenters);
    if (newSelected.has(datacenterId)) {
      newSelected.delete(datacenterId);
    } else {
      newSelected.add(datacenterId);
    }
    setSelectedDatacenters(newSelected);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Get all assignments (since backend doesn't support filtering)
      const currentResponse = await axios.get<any>('/api/datacenter-monitors?size=10000');
      const allAssignments = Array.isArray(currentResponse.data) ? currentResponse.data : currentResponse.data.content || [];

      // Filter to only assignments for this monitor
      const current = allAssignments.filter((a: any) => a.monitor?.id === monitorId);

      // Prepare changes
      const currentIds = new Set(current.map((a: any) => a.datacenter?.id));
      const toDelete = current.filter((a: any) => !selectedDatacenters.has(a.datacenter?.id));
      const toCreate = Array.from(selectedDatacenters).filter(dcId => !currentIds.has(dcId));

      console.warn(
        'Current assignments:',
        current.map((a: any) => a.datacenter?.id),
      );
      console.warn('Selected datacenters:', selectedDatacenters);
      console.warn(
        'To delete:',
        toDelete.map((a: any) => ({ id: a.id, dcId: a.datacenter?.id })),
      );
      console.warn('To create:', toCreate);

      // Delete assignments that were unchecked
      for (const assignment of toDelete) {
        await axios.delete(`/api/datacenter-monitors/${assignment.id}`);
      }

      // Create new assignments
      for (const datacenterId of toCreate) {
        console.warn('Creating assignment for monitor', monitorId, 'datacenter', datacenterId);
        await axios.post('/api/datacenter-monitors', {
          monitor: { id: monitorId },
          datacenter: { id: datacenterId },
        });
      }

      onSave();
      toggle();
    } catch (err) {
      setError('Failed to save assignments. Please try again.');
      console.error('Error saving:', err);
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        Assign Datacenters for Monitor: <strong>{monitorName}</strong>
      </ModalHeader>
      <ModalBody>
        {error && <Alert color="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center p-4">
            <Spinner color="primary" />
            <p className="mt-2">Loading datacenters...</p>
          </div>
        ) : datacenters.length === 0 ? (
          <Alert color="info">No datacenters available. Please create datacenters first.</Alert>
        ) : (
          <div>
            <p className="text-muted mb-3">Select which datacenters should run this monitor:</p>
            <div className="datacenter-checklist">
              {datacenters.map(dc => (
                <FormGroup check key={dc.id} className="mb-2">
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={selectedDatacenters.has(dc.id)}
                      onChange={() => toggleDatacenter(dc.id)}
                      disabled={saving}
                    />
                    <strong>{dc.name}</strong> <span className="text-muted">({dc.code})</span>
                  </Label>
                </FormGroup>
              ))}
            </div>
            <Alert color="info" className="mt-3 mb-0">
              <FontAwesomeIcon icon="info-circle" /> Selected: {selectedDatacenters.size} of {datacenters.length} datacenters
            </Alert>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle} disabled={saving}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSave} disabled={loading || saving || datacenters.length === 0}>
          {saving ? (
            <>
              <Spinner size="sm" className="me-2" />
              Saving...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon="save" className="me-2" />
              Save Assignments
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DatacenterMonitorAssign;
