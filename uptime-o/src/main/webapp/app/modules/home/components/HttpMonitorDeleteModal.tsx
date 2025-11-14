import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faTrash } from '@fortawesome/free-solid-svg-icons';
import { IHttpMonitor } from 'app/shared/model/http-monitor.model';
import axios from 'axios';
import { toast } from 'react-toastify';

interface HttpMonitorDeleteModalProps {
  isOpen: boolean;
  toggle: () => void;
  monitor?: IHttpMonitor | null;
  onDelete?: () => void;
}

export const HttpMonitorDeleteModal: React.FC<HttpMonitorDeleteModalProps> = ({ isOpen, toggle, monitor, onDelete }) => {
  const [deleting, setDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (monitor && monitor.id) {
      setDeleting(true);
      try {
        await axios.delete(`/api/http-monitors/${monitor.id}`);
        toast.success('Monitor deleted successfully');
        toggle();
        onDelete?.();
      } catch (error) {
        toast.error('Failed to delete monitor');
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle} data-cy="httpMonitorDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="uptimeOApp.httpMonitor.delete.question">
        Are you sure you want to delete Monitor <strong>{monitor?.name || monitor?.id}</strong>?
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle} disabled={deleting}>
          <FontAwesomeIcon icon={faBan} />
          &nbsp; Cancel
        </Button>
        <Button
          id="jhi-confirm-delete-httpMonitor"
          data-cy="entityConfirmDeleteButton"
          color="danger"
          onClick={handleConfirmDelete}
          disabled={deleting}
        >
          <FontAwesomeIcon icon={faTrash} />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default HttpMonitorDeleteModal;
