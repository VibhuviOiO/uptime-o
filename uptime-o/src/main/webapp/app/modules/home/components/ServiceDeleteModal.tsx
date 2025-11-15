import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

interface ServiceDeleteModalProps {
  isOpen: boolean;
  toggle: () => void;
  serviceId: number | null;
  onDelete: () => void;
}

export const ServiceDeleteModal: React.FC<ServiceDeleteModalProps> = ({ isOpen, toggle, serviceId, onDelete }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!serviceId) return;
    setLoading(true);
    try {
      await axios.delete(`/api/services/${serviceId}`);
      toast.success('Service deleted successfully');
      onDelete();
      toggle();
    } catch (error) {
      toast.error('Failed to delete service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Confirm Delete</ModalHeader>
      <ModalBody>Are you sure you want to delete this service?</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle} disabled={loading}>
          Cancel
        </Button>
        <Button color="danger" onClick={handleDelete} disabled={loading}>
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ServiceDeleteModal;
