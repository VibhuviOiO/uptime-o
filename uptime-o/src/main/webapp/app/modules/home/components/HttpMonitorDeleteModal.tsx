import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { deleteEntity, reset } from 'app/entities/http-monitor/http-monitor.reducer';
import { IHttpMonitor } from 'app/shared/model/http-monitor.model';

interface HttpMonitorDeleteModalProps {
  isOpen: boolean;
  toggle: () => void;
  monitor?: IHttpMonitor | null;
  onDelete?: () => void;
}

export const HttpMonitorDeleteModal: React.FC<HttpMonitorDeleteModalProps> = ({ isOpen, toggle, monitor, onDelete }) => {
  const dispatch = useAppDispatch();
  const [loadModal, setLoadModal] = useState(false);

  const updating = useAppSelector(state => state.httpMonitor.updating);
  const updateSuccess = useAppSelector(state => state.httpMonitor.updateSuccess);

  useEffect(() => {
    if (isOpen && monitor) {
      setLoadModal(true);
    } else if (isOpen) {
      dispatch(reset());
    }
  }, [isOpen, monitor, dispatch]);

  useEffect(() => {
    if (updateSuccess && loadModal) {
      setLoadModal(false);
      toggle();
      onDelete?.();
    }
  }, [updateSuccess, loadModal, toggle, onDelete]);

  const handleConfirmDelete = () => {
    if (monitor && monitor.id) {
      dispatch(deleteEntity(monitor.id));
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
        <Button color="secondary" onClick={toggle} disabled={updating}>
          <FontAwesomeIcon icon={faBan} />
          &nbsp; Cancel
        </Button>
        <Button
          id="jhi-confirm-delete-httpMonitor"
          data-cy="entityConfirmDeleteButton"
          color="danger"
          onClick={handleConfirmDelete}
          disabled={updating}
        >
          <FontAwesomeIcon icon={faTrash} />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default HttpMonitorDeleteModal;
