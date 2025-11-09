import React, { useEffect, useState } from 'react';
import { Button, Table, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash, faGlobe, faPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import RegionEditModal from 'app/modules/home/components/RegionEditModal';
import RegionDeleteModal from 'app/modules/home/components/RegionDeleteModal';

interface IRegion {
  id?: number;
  name?: string;
  regionCode?: string;
  groupName?: string;
}

export const RegionsTab = () => {
  const [regions, setRegions] = useState<IRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    setLoading(true);
    try {
      const response = await axios.get<IRegion[]>('/api/regions?page=0&size=1000&sort=id,desc');
      setRegions(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load regions');
      setLoading(false);
    }
  };

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
    loadRegions();
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner color="primary" />
        <p className="mt-2">Loading regions...</p>
      </div>
    );
  }

  return (
    <div className="tab-content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>
          <FontAwesomeIcon icon={faGlobe} className="me-2" />
          Regions
        </h5>
        <Button color="primary" size="sm" onClick={handleCreateClick}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          New Region
        </Button>
      </div>

      {!regions || regions.length === 0 ? (
        <div className="alert alert-info">
          <p>No regions found. Create one to get started.</p>
        </div>
      ) : (
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Region Code</th>
              <th>Group Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {regions.map((region, i) => (
              <tr key={`entity-${i}`}>
                <td>{region.name}</td>
                <td>{region.regionCode || '-'}</td>
                <td>{region.groupName || '-'}</td>
                <td>
                  <Button
                    color="link"
                    size="sm"
                    onClick={() => handleEditClick(region.id)}
                    title="Edit"
                    style={{ padding: 0, marginRight: '0.5rem' }}
                  >
                    <FontAwesomeIcon icon={faPencil} />
                  </Button>
                  <Button
                    color="link"
                    size="sm"
                    onClick={() => handleDeleteClick(region.id)}
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

export default RegionsTab;
