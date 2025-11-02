import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faEye, faPencil } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities } from 'app/entities/datacenter/datacenter.reducer';
import './DatacentersWidget.scss';

export const DatacentersWidget = () => {
  const dispatch = useAppDispatch();
  const [pageNum, setPageNum] = useState(0);

  const datacenterList = useAppSelector(state => state.datacenter.entities);
  const loading = useAppSelector(state => state.datacenter.loading);
  const totalItems = useAppSelector(state => state.datacenter.totalItems);

  useEffect(() => {
    dispatch(
      getEntities({
        page: pageNum,
        size: 5,
        sort: 'id,desc',
      }),
    );
  }, [dispatch, pageNum]);

  if (!datacenterList || datacenterList.length === 0) {
    return (
      <div className="datacenters-widget">
        <div className="widget-header">
          <h3>
            <FontAwesomeIcon icon={faBuilding} className="me-2" />
            Datacenters
          </h3>
        </div>
        <div className="widget-empty">
          <p>No datacenters found.</p>
          <Link to="/datacenter/new" className="btn btn-primary btn-sm">
            <span>Create Datacenter</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="datacenters-widget">
      <div className="widget-header">
        <h3>
          <FontAwesomeIcon icon={faBuilding} className="me-2" />
          Datacenters
          {totalItems > 0 && <span className="widget-count">{totalItems}</span>}
        </h3>
        <Link to="/datacenter" className="widget-link">
          View All
        </Link>
      </div>
      <div className="widget-table-container">
        <table className="widget-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Code</th>
              <th>Name</th>
              <th>Region</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {datacenterList.map((datacenter, index) => (
              <tr key={`entity-${index}`}>
                <td className="id-cell">
                  <span className="badge">{datacenter.id}</span>
                </td>
                <td className="code-cell">{datacenter.code}</td>
                <td className="name-cell">
                  <strong>{datacenter.name}</strong>
                </td>
                <td className="region-cell">{datacenter.region ? datacenter.region.name : '-'}</td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <Link to={`/datacenter/${datacenter.id}`} className="action-btn btn-view" title="View">
                      <FontAwesomeIcon icon={faEye} />
                    </Link>
                    <Link to={`/datacenter/${datacenter.id}/edit`} className="action-btn btn-edit" title="Edit">
                      <FontAwesomeIcon icon={faPencil} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="widget-pagination">
        Showing {datacenterList.length} of {totalItems} datacenters
      </div>
    </div>
  );
};
