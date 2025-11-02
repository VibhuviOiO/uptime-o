import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faServer, faEye, faPencil } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities } from 'app/entities/agent/agent.reducer';
import './AgentsWidget.scss';

export const AgentsWidget = () => {
  const dispatch = useAppDispatch();
  const [pageNum, setPageNum] = useState(0);

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

  return (
    <div className="agents-widget">
      <div className="widget-header">
        <h3>
          <FontAwesomeIcon icon={faServer} className="me-2" />
          Agents
          {totalItems > 0 && <span className="widget-count">{totalItems}</span>}
        </h3>
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
                <th>ID</th>
                <th>Name</th>
                <th>Datacenter</th>
              </tr>
            </thead>
            <tbody>
              {agentList.map((agent, i) => (
                <tr key={`entity-${i}`}>
                  <td className="id-cell">
                    <span className="badge">{agent.id}</span>
                  </td>
                  <td className="name-cell">
                    <strong>{agent.name || '-'}</strong>
                  </td>
                  <td className="datacenter-cell">
                    {agent.datacenter ? (
                      <span className="datacenter-name">{agent.datacenter.name}</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <Link to={`/agent/${agent.id}`} className="action-btn btn-view" title="View">
                        <FontAwesomeIcon icon={faEye} />
                      </Link>
                      <Link to={`/agent/${agent.id}/edit`} className="action-btn btn-edit" title="Edit">
                        <FontAwesomeIcon icon={faPencil} />
                      </Link>
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
          <Link to="/agent/new" className="btn btn-sm btn-primary">
            Create Agent
          </Link>
        </div>
      )}
    </div>
  );
};

export default AgentsWidget;
