import React, { useEffect, useState } from 'react';
import { Button, Table, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash, faServer, faPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import DatacenterEditModal from 'app/modules/home/components/DatacenterEditModal';
import DatacenterDeleteModal from 'app/modules/home/components/DatacenterDeleteModal';

interface IRegion {
  id?: number;
  name?: string;
}

interface IDatacenter {
  id?: number;
  name?: string;
  code?: string;
  regionId?: number;
  region?: IRegion;
}

export const DatacentersTab = () => {
  const [datacenters, setDatacenters] = useState<IDatacenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDatacenterId, setSelectedDatacenterId] = useState<number | null>(null);

  useEffect(() => {
    loadDatacenters();
  }, []);

  const loadDatacenters = async () => {
    setLoading(true);
    try {
      const response = await axios.get<IDatacenter[]>('/api/datacenters?page=0&size=1000&sort=id,desc');
      setDatacenters(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load datacenters');
      setLoading(false);
    }
  };

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
    loadDatacenters();
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner color="primary" />
        <p className="mt-2">Loading datacenters...</p>
      </div>
    );
  }

  return (
    <div className="tab-content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>
          <FontAwesomeIcon icon={faServer} className="me-2" />
          Datacenters
        </h5>
        <Button color="primary" size="sm" onClick={handleCreateClick}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          New Datacenter
        </Button>
      </div>

      {!datacenters || datacenters.length === 0 ? (
        <div className="alert alert-info">
          <p>No datacenters found. Create one to get started.</p>
        </div>
      ) : (
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Region</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {datacenters.map((datacenter, i) => (
              <tr key={`entity-${i}`}>
                <td>{datacenter.name}</td>
                <td>{datacenter.code || '-'}</td>
                <td>{datacenter.region?.name || '-'}</td>
                <td>
                  <Button
                    color="link"
                    size="sm"
                    onClick={() => handleEditClick(datacenter.id)}
                    title="Edit"
                    style={{ padding: 0, marginRight: '0.5rem' }}
                  >
                    <FontAwesomeIcon icon={faPencil} />
                  </Button>
                  <Button
                    color="link"
                    size="sm"
                    onClick={() => handleDeleteClick(datacenter.id)}
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

export default DatacentersTab;
