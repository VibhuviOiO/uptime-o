import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { deleteEntity, getEntity, reset } from 'app/entities/instance/instance.reducer';

interface InstanceDeleteModalProps {
  isOpen: boolean;
  toggle: () => void;
  instanceId?: number | null;
  onDelete?: () => void;
}

export const InstanceDeleteModal: React.FC<InstanceDeleteModalProps> = ({ isOpen, toggle, instanceId, onDelete }) => {
  const dispatch = useAppDispatch();
  const [loadModal, setLoadModal] = useState(false);

  const instanceEntity = useAppSelector(state => state.instance.entity);
  const updating = useAppSelector(state => state.instance.updating);
  const updateSuccess = useAppSelector(state => state.instance.updateSuccess);

  useEffect(() => {
    if (isOpen && instanceId) {
      dispatch(reset());
      dispatch(getEntity(instanceId));
      setLoadModal(true);
    } else if (isOpen) {
      dispatch(reset());
    }
  }, [isOpen, instanceId, dispatch]);

  useEffect(() => {
    if (updateSuccess && loadModal) {
      setLoadModal(false);
      toggle();
      onDelete?.();
    }
  }, [updateSuccess, loadModal, toggle, onDelete]);

  const handleConfirmDelete = () => {
    if (instanceEntity && instanceEntity.id) {
      dispatch(deleteEntity(instanceEntity.id));
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Confirm delete operation</ModalHeader>
      <ModalBody>
        Are you sure you want to delete Instance <strong>{instanceEntity?.name || instanceEntity?.id}</strong>?
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle} disabled={updating}>
          <FontAwesomeIcon icon={faBan} />
          &nbsp; Cancel
        </Button>
        <Button color="danger" onClick={handleConfirmDelete} disabled={updating}>
          <FontAwesomeIcon icon={faTrash} />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default InstanceDeleteModal;
