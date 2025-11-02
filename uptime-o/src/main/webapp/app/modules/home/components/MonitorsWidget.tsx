import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faEye, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities } from 'app/entities/http-monitor/http-monitor.reducer';

export const MonitorsWidget = () => {
  const dispatch = useAppDispatch();
  const [pageNum, setPageNum] = useState(0);

  const monitorList = useAppSelector(state => state.httpMonitor.entities);
  const loading = useAppSelector(state => state.httpMonitor.loading);
  const totalItems = useAppSelector(state => state.httpMonitor.totalItems);

  useEffect(() => {
    dispatch(
      getEntities({
        page: pageNum,
        size: 5,
        sort: 'id,desc',
      }),
    );
  }, [dispatch, pageNum]);

  if (!monitorList || monitorList.length === 0) {
    return (
      <div className="monitors-widget">
        <div className="widget-header">
          <h3>
            <FontAwesomeIcon icon={faChartLine} className="me-2" />
            Monitors
          </h3>
        </div>
        <div className="widget-empty">
          <p>No monitors found.</p>
          <Link to="/http-monitor/new" className="btn btn-primary btn-sm">
            <span>Create Monitor</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="monitors-widget">
      <div className="widget-header">
        <h3>
          <FontAwesomeIcon icon={faChartLine} className="me-2" />
          Monitors
          {totalItems > 0 && <span className="widget-count">{totalItems}</span>}
        </h3>
        <Link to="/http-monitor" className="widget-link">
          View All
        </Link>
      </div>
      <div className="widget-table-container">
        <table className="widget-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>URL</th>
              <th>Method</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {monitorList.map((monitor, index) => (
              <tr key={`entity-${index}`}>
                <td className="name-cell">
                  <strong>{monitor.name}</strong>
                </td>
                <td className="metadata-cell">
                  {monitor.url ? (
                    <a href={monitor.url} target="_blank" rel="noopener noreferrer" title={monitor.url}>
                      {monitor.url.length > 25 ? `${monitor.url.substring(0, 25)}...` : monitor.url}
                    </a>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td className="method-cell">
                  <span className="badge bg-info">{monitor.method || 'GET'}</span>
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <Link to={`/http-monitor/${monitor.id}`} className="action-btn btn-view" title="View">
                      <FontAwesomeIcon icon={faEye} />
                    </Link>
                    <Link to={`/http-monitor/${monitor.id}/edit`} className="action-btn btn-edit" title="Edit">
                      <FontAwesomeIcon icon={faPencil} />
                    </Link>
                    <Link to={`/http-monitor/${monitor.id}/delete`} className="action-btn btn-delete" title="Delete">
                      <FontAwesomeIcon icon={faTrash} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="widget-pagination">
        Showing {monitorList.length} of {totalItems} monitors
      </div>
    </div>
  );
};
