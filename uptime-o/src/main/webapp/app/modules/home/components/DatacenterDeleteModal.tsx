import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { deleteEntity, getEntity, reset } from 'app/entities/datacenter/datacenter.reducer';

interface DatacenterDeleteModalProps {
  isOpen: boolean;
  toggle: () => void;
  datacenterId?: number | null;
  onDelete?: () => void;
}

export const DatacenterDeleteModal: React.FC<DatacenterDeleteModalProps> = ({ isOpen, toggle, datacenterId, onDelete }) => {
  const dispatch = useAppDispatch();
  const [loadModal, setLoadModal] = useState(false);

  const datacenterEntity = useAppSelector(state => state.datacenter.entity);
  const updating = useAppSelector(state => state.datacenter.updating);
  const updateSuccess = useAppSelector(state => state.datacenter.updateSuccess);

  useEffect(() => {
    if (isOpen && datacenterId) {
      dispatch(getEntity(datacenterId));
      setLoadModal(true);
    } else if (isOpen) {
      dispatch(reset());
    }
  }, [isOpen, datacenterId, dispatch]);

  useEffect(() => {
    if (updateSuccess && loadModal) {
      setLoadModal(false);
      toggle();
      onDelete?.();
    }
  }, [updateSuccess, loadModal, toggle, onDelete]);

  const handleConfirmDelete = () => {
    if (datacenterEntity && datacenterEntity.id) {
      dispatch(deleteEntity(datacenterEntity.id));
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle} data-cy="datacenterDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="uptimeOApp.datacenter.delete.question">
        Are you sure you want to delete Datacenter <strong>{datacenterEntity?.name || datacenterEntity?.id}</strong>?
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle} disabled={updating}>
          <FontAwesomeIcon icon={faBan} />
          &nbsp; Cancel
        </Button>
        <Button
          id="jhi-confirm-delete-datacenter"
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

export default DatacenterDeleteModal;
