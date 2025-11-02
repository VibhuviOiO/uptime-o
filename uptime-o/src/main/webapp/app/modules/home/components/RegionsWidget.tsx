import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faEye, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities } from 'app/entities/region/region.reducer';
import './RegionsWidget.scss';

export const RegionsWidget = () => {
  const dispatch = useAppDispatch();
  const [pageNum, setPageNum] = useState(0);

  const regionList = useAppSelector(state => state.region.entities);
  const loading = useAppSelector(state => state.region.loading);
  const totalItems = useAppSelector(state => state.region.totalItems);

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
    <div className="regions-widget">
      <div className="widget-header">
        <h3>
          <FontAwesomeIcon icon={faGlobe} className="me-2" />
          Regions
          {totalItems > 0 && <span className="widget-count">{totalItems}</span>}
        </h3>
        <Link to="/region" className="widget-link">
          View All
        </Link>
      </div>

      {loading ? (
        <div className="widget-loading">
          <p>Loading regions...</p>
        </div>
      ) : regionList && regionList.length > 0 ? (
        <div className="widget-table-container">
          <table className="widget-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {regionList.map((region, i) => (
                <tr key={`entity-${i}`}>
                  <td className="id-cell">
                    <span className="badge">{region.id}</span>
                  </td>
                  <td className="code-cell">{region.regionCode || '-'}</td>
                  <td className="name-cell">
                    <strong>{region.name || '-'}</strong>
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <Link to={`/region/${region.id}`} className="action-btn btn-view" title="View">
                        <FontAwesomeIcon icon={faEye} />
                      </Link>
                      <Link to={`/region/${region.id}/edit`} className="action-btn btn-edit" title="Edit">
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
                Showing {Math.min(5, regionList.length)} of {totalItems} regions
              </small>
            </div>
          )}
        </div>
      ) : (
        <div className="widget-empty">
          <p>No regions configured</p>
          <Link to="/region/new" className="btn btn-sm btn-primary">
            Create Region
          </Link>
        </div>
      )}
    </div>
  );
};

export default RegionsWidget;
