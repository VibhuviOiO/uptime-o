import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { deleteEntity, getEntity, reset } from 'app/entities/region/region.reducer';

interface RegionDeleteModalProps {
  isOpen: boolean;
  toggle: () => void;
  regionId?: number | null;
  onDelete?: () => void;
}

export const RegionDeleteModal: React.FC<RegionDeleteModalProps> = ({ isOpen, toggle, regionId, onDelete }) => {
  const dispatch = useAppDispatch();
  const [loadModal, setLoadModal] = useState(false);

  const regionEntity = useAppSelector(state => state.region.entity);
  const updating = useAppSelector(state => state.region.updating);
  const updateSuccess = useAppSelector(state => state.region.updateSuccess);

  useEffect(() => {
    if (isOpen && regionId) {
      dispatch(getEntity(regionId));
      setLoadModal(true);
    } else if (isOpen) {
      dispatch(reset());
    }
  }, [isOpen, regionId, dispatch]);

  useEffect(() => {
    if (updateSuccess && loadModal) {
      setLoadModal(false);
      toggle();
      onDelete?.();
    }
  }, [updateSuccess, loadModal, toggle, onDelete]);

  const handleConfirmDelete = () => {
    if (regionEntity && regionEntity.id) {
      dispatch(deleteEntity(regionEntity.id));
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle} data-cy="regionDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="uptimeOApp.region.delete.question">
        Are you sure you want to delete Region <strong>{regionEntity?.name || regionEntity?.id}</strong>?
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle} disabled={updating}>
          <FontAwesomeIcon icon={faBan} />
          &nbsp; Cancel
        </Button>
        <Button
          id="jhi-confirm-delete-region"
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

export default RegionDeleteModal;
