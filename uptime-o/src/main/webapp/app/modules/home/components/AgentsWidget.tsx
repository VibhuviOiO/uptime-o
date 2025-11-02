import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faServer, faPencil, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities } from 'app/entities/agent/agent.reducer';
import { AgentEditModal } from './AgentEditModal';
import { AgentDeleteModal } from './AgentDeleteModal';

export const AgentsWidget = () => {
  const dispatch = useAppDispatch();
  const [pageNum, setPageNum] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);

  const agentList = useAppSelector(state => state.agent.entities);
  const loading = useAppSelector(state => state.agent.loading);
  const totalItems = useAppSelector(state => state.agent.totalItems);

  useEffect(() => {
    dispatch(
      getEntities({
        page: pageNum,
        size: 5, // Limit to 5 items for widget
        sort: 'id,desc',
      }),
    );
  }, [dispatch, pageNum]);

  const handleEditClick = (agentId: number) => {
    setSelectedAgentId(agentId);
    setEditModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedAgentId(null);
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
    dispatch(
      getEntities({
        page: pageNum,
        size: 5,
        sort: 'id,desc',
      }),
    );
  };

  const handleDeleteSuccess = () => {
    dispatch(
      getEntities({
        page: pageNum,
        size: 5,
        sort: 'id,desc',
      }),
    );
  };

  return (
    <div className="agents-widget">
      <div className="widget-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ margin: 0 }}>
            <FontAwesomeIcon icon={faServer} className="me-2" />
            Agents
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
            title="Create Agent"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        <Link to="/agent" className="widget-link">
          View All
        </Link>
      </div>

      {loading ? (
        <div className="widget-loading">
          <p>Loading agents...</p>
        </div>
      ) : agentList && agentList.length > 0 ? (
        <div className="widget-table-container">
          <table className="widget-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Datacenter</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agentList.map((agent, i) => (
                <tr key={`entity-${i}`}>
                  <td className="name-cell">
                    <strong>{agent.name || '-'}</strong>
                  </td>
                  <td className="metadata-cell">
                    {agent.datacenter ? (
                      <span className="metadata-name">{agent.datacenter.name}</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button
                        className="action-btn btn-edit"
                        title="Edit"
                        onClick={() => handleEditClick(agent.id)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <FontAwesomeIcon icon={faPencil} />
                      </button>
                      <button
                        className="action-btn btn-delete"
                        title="Delete"
                        onClick={() => handleDeleteClick(agent.id)}
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
                Showing {Math.min(5, agentList.length)} of {totalItems} agents
              </small>
            </div>
          )}
        </div>
      ) : (
        <div className="widget-empty">
          <p>No agents configured</p>
          <button className="btn btn-sm btn-primary" onClick={handleCreateClick} style={{ border: 'none', cursor: 'pointer' }}>
            Create Agent
          </button>
        </div>
      )}

      <AgentEditModal isOpen={editModalOpen} toggle={handleCloseEditModal} agentId={selectedAgentId} onSave={handleEditSuccess} />
      <AgentDeleteModal isOpen={deleteModalOpen} toggle={handleCloseDeleteModal} agentId={selectedAgentId} onDelete={handleDeleteSuccess} />
    </div>
  );
};

export default AgentsWidget;
