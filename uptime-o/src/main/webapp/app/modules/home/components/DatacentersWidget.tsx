import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faPencil, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities } from 'app/entities/datacenter/datacenter.reducer';
import DatacenterEditModal from './DatacenterEditModal';
import DatacenterDeleteModal from './DatacenterDeleteModal';

export const DatacentersWidget = () => {
  const dispatch = useAppDispatch();
  const [pageNum, setPageNum] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDatacenterId, setSelectedDatacenterId] = useState<number | null>(null);

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

  const handleCreateClick = () => {
    setSelectedDatacenterId(null);
    setModalOpen(true);
  };

  const handleEditClick = (datacenterId: number) => {
    setSelectedDatacenterId(datacenterId);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDatacenterId(null);
  };

  const handleDeleteClick = (datacenterId: number) => {
    setSelectedDatacenterId(datacenterId);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedDatacenterId(null);
  };

  const handleSaveSuccess = () => {
    // Refresh the list after successful save
    dispatch(
      getEntities({
        page: pageNum,
        size: 5,
        sort: 'id,desc',
      }),
    );
  };

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
          <button className="btn btn-sm btn-primary" onClick={handleCreateClick} style={{ border: 'none', cursor: 'pointer' }}>
            Create Datacenter
          </button>
        </div>

        <DatacenterEditModal isOpen={modalOpen} toggle={handleCloseModal} datacenterId={selectedDatacenterId} onSave={handleSaveSuccess} />
        <DatacenterDeleteModal
          isOpen={deleteModalOpen}
          toggle={handleCloseDeleteModal}
          datacenterId={selectedDatacenterId}
          onDelete={handleSaveSuccess}
        />
      </div>
    );
  }

  return (
    <div className="datacenters-widget">
      <div className="widget-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ margin: 0 }}>
            <FontAwesomeIcon icon={faBuilding} className="me-2" />
            Datacenters
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
            title="Create Datacenter"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        <Link to="/datacenter" className="widget-link">
          View All
        </Link>
      </div>
      <div className="widget-table-container">
        <table className="widget-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Region</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {datacenterList.map((datacenter, index) => (
              <tr key={`entity-${index}`}>
                <td className="code-cell">{datacenter.code}</td>
                <td className="name-cell">
                  <strong>{datacenter.name}</strong>
                </td>
                <td className="metadata-cell">{datacenter.region ? datacenter.region.name : '-'}</td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button
                      className="action-btn btn-edit"
                      title="Edit"
                      onClick={() => handleEditClick(datacenter.id)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <FontAwesomeIcon icon={faPencil} />
                    </button>
                    <button
                      className="action-btn btn-delete"
                      title="Delete"
                      onClick={() => handleDeleteClick(datacenter.id)}
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
      </div>
      <div className="widget-pagination">
        Showing {datacenterList.length} of {totalItems} datacenters
      </div>

      <DatacenterEditModal isOpen={modalOpen} toggle={handleCloseModal} datacenterId={selectedDatacenterId} onSave={handleSaveSuccess} />
      <DatacenterDeleteModal
        isOpen={deleteModalOpen}
        toggle={handleCloseDeleteModal}
        datacenterId={selectedDatacenterId}
        onDelete={handleSaveSuccess}
      />
    </div>
  );
};
