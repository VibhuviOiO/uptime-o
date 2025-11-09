import React, { useEffect, useState } from 'react';
import { Button, Table, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash, faClock, faPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ScheduleEditModal } from 'app/modules/home/components/ScheduleEditModal';

interface ISchedule {
  id?: number;
  name?: string;
  interval?: number;
  includeResponseBody?: boolean;
  thresholdsWarning?: number;
  thresholdsCritical?: number;
}

export const SchedulesTab = () => {
  const [schedules, setSchedules] = useState<ISchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const response = await axios.get<ISchedule[]>('/api/schedules?page=0&size=1000&sort=id,desc');
      setSchedules(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load schedules');
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedScheduleId(null);
    setModalOpen(true);
  };

  const handleEditClick = (scheduleId: number) => {
    setSelectedScheduleId(scheduleId);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedScheduleId(null);
  };

  const handleSaveSuccess = () => {
    loadSchedules();
  };

  const handleDelete = async (scheduleId: number) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await axios.delete(`/api/schedules/${scheduleId}`);
        toast.success('Schedule deleted successfully');
        loadSchedules();
      } catch (error) {
        toast.error('Failed to delete schedule');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner color="primary" />
        <p className="mt-2">Loading schedules...</p>
      </div>
    );
  }

  return (
    <div className="tab-content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>
          <FontAwesomeIcon icon={faClock} className="me-2" />
          Schedules
        </h5>
        <Button color="primary" size="sm" onClick={handleCreateClick}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          New Schedule
        </Button>
      </div>

      {!schedules || schedules.length === 0 ? (
        <div className="alert alert-info">
          <p>No schedules found. Create one to get started.</p>
        </div>
      ) : (
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Interval</th>
              <th>Include Response Body</th>
              <th>Warning Threshold</th>
              <th>Critical Threshold</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule, i) => (
              <tr key={`entity-${i}`}>
                <td>{schedule.name}</td>
                <td>{schedule.interval ? `${schedule.interval}ms` : '-'}</td>
                <td>{schedule.includeResponseBody ? 'Yes' : 'No'}</td>
                <td>{schedule.thresholdsWarning ? `${schedule.thresholdsWarning}ms` : '-'}</td>
                <td>{schedule.thresholdsCritical ? `${schedule.thresholdsCritical}ms` : '-'}</td>
                <td>
                  <Button
                    color="link"
                    size="sm"
                    onClick={() => handleEditClick(schedule.id)}
                    title="Edit"
                    style={{ padding: 0, marginRight: '0.5rem' }}
                  >
                    <FontAwesomeIcon icon={faPencil} />
                  </Button>
                  <Button
                    color="link"
                    size="sm"
                    onClick={() => handleDelete(schedule.id)}
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

      <ScheduleEditModal isOpen={modalOpen} toggle={handleCloseModal} scheduleId={selectedScheduleId} onSave={handleSaveSuccess} />
    </div>
  );
};

export default SchedulesTab;
