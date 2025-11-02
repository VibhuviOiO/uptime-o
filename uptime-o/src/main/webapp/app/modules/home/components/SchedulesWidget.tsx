import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faPencil, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities } from 'app/entities/schedule/schedule.reducer';

export const SchedulesWidget = () => {
  const dispatch = useAppDispatch();
  const [pageNum, setPageNum] = useState(0);

  const scheduleList = useAppSelector(state => state.schedule.entities);
  const loading = useAppSelector(state => state.schedule.loading);
  const totalItems = useAppSelector(state => state.schedule.totalItems);

  useEffect(() => {
    dispatch(
      getEntities({
        page: pageNum,
        size: 5, // Limit to 5 items for widget
        sort: 'id,desc',
      }),
    );
  }, [dispatch, pageNum]);

  const handleCreateClick = () => {
    // Navigate to schedule creation
    window.location.href = '/schedule/new';
  };

  const handleEditClick = (scheduleId: number) => {
    // Navigate to schedule edit
    window.location.href = `/schedule/${scheduleId}/edit`;
  };

  const handleDeleteClick = (scheduleId: number) => {
    // Navigate to schedule delete
    window.location.href = `/schedule/${scheduleId}/delete`;
  };

  return (
    <div className="schedules-widget">
      <div className="widget-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ margin: 0 }}>
            <FontAwesomeIcon icon={faClock} className="me-2" />
            Schedules
            {totalItems > 0 && <span className="widget-count">{totalItems}</span>}
          </h3>
          <button
            onClick={handleCreateClick}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: '#0d6efd',
              fontSize: '1rem',
            }}
            title="Create Schedule"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        <Link to="/schedule" className="widget-link">
          View All
        </Link>
      </div>

      {loading ? (
        <div className="widget-loading">
          <p>Loading schedules...</p>
        </div>
      ) : scheduleList && scheduleList.length > 0 ? (
        <div className="widget-table-container">
          <table className="widget-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Cron</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scheduleList.map((schedule, i) => (
                <tr key={`entity-${i}`}>
                  <td className="name-cell">
                    <strong>{schedule.name || '-'}</strong>
                  </td>
                  <td style={{ minWidth: '150px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#555' }}>
                    {schedule.cronExpression || '-'}
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button
                        className="action-btn btn-edit"
                        title="Edit"
                        onClick={() => handleEditClick(schedule.id)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <FontAwesomeIcon icon={faPencil} />
                      </button>
                      <button
                        className="action-btn btn-delete"
                        title="Delete"
                        onClick={() => handleDeleteClick(schedule.id)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalItems > 5 && (
            <div className="widget-pagination">
              <small className="text-muted">
                Showing {Math.min(5, scheduleList.length)} of {totalItems} schedules
              </small>
            </div>
          )}
        </div>
      ) : (
        <div className="widget-empty">
          <p>No schedules found.</p>
          <button className="btn btn-sm btn-primary" onClick={handleCreateClick} style={{ border: 'none', cursor: 'pointer' }}>
            Create Schedule
          </button>
        </div>
      )}
    </div>
  );
};

export default SchedulesWidget;
