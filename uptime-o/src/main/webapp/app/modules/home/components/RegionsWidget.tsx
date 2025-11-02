import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faPencil, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities } from 'app/entities/region/region.reducer';
import RegionEditModal from './RegionEditModal';
import RegionDeleteModal from './RegionDeleteModal';

export const RegionsWidget = () => {
  const dispatch = useAppDispatch();
  const [pageNum, setPageNum] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);

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

  const handleCreateClick = () => {
    setSelectedRegionId(null);
    setModalOpen(true);
  };

  const handleEditClick = (regionId: number) => {
    setSelectedRegionId(regionId);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRegionId(null);
  };

  const handleDeleteClick = (regionId: number) => {
    setSelectedRegionId(regionId);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedRegionId(null);
  };

  const handleDeleteSuccess = () => {
    // Refresh the list after successful delete
    dispatch(
      getEntities({
        page: pageNum,
        size: 5,
        sort: 'id,desc',
      }),
    );
  };

  return (
    <div className="regions-widget">
      <div className="widget-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ margin: 0 }}>
            <FontAwesomeIcon icon={faGlobe} className="me-2" />
            Regions
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
            title="Create Region"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
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
                <th>Code</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {regionList.map((region, i) => (
                <tr key={`entity-${i}`}>
                  <td className="code-cell">{region.regionCode || '-'}</td>
                  <td className="name-cell">
                    <strong>{region.name || '-'}</strong>
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button
                        className="action-btn btn-edit"
                        title="Edit"
                        onClick={() => handleEditClick(region.id)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <FontAwesomeIcon icon={faPencil} />
                      </button>
                      <button
                        className="action-btn btn-delete"
                        title="Delete"
                        onClick={() => handleDeleteClick(region.id)}
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
                Showing {Math.min(5, regionList.length)} of {totalItems} regions
              </small>
            </div>
          )}
        </div>
      ) : (
        <div className="widget-empty">
          <p>No regions configured</p>
          <button className="btn btn-sm btn-primary" onClick={handleCreateClick} style={{ border: 'none', cursor: 'pointer' }}>
            Create Region
          </button>
        </div>
      )}

      <RegionEditModal isOpen={modalOpen} toggle={handleCloseModal} regionId={selectedRegionId} onSave={handleDeleteSuccess} />
      <RegionDeleteModal
        isOpen={deleteModalOpen}
        toggle={handleCloseDeleteModal}
        regionId={selectedRegionId}
        onDelete={handleDeleteSuccess}
      />
    </div>
  );
};

export default RegionsWidget;
