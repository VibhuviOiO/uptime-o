import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { deleteEntity, getEntity, reset } from 'app/entities/agent/agent.reducer';

interface AgentDeleteModalProps {
  isOpen: boolean;
  toggle: () => void;
  agentId?: number | null;
  onDelete?: () => void;
}

export const AgentDeleteModal: React.FC<AgentDeleteModalProps> = ({ isOpen, toggle, agentId, onDelete }) => {
  const dispatch = useAppDispatch();
  const [loadModal, setLoadModal] = useState(false);

  const agentEntity = useAppSelector(state => state.agent.entity);
  const updating = useAppSelector(state => state.agent.updating);
  const updateSuccess = useAppSelector(state => state.agent.updateSuccess);

  useEffect(() => {
    if (isOpen && agentId) {
      dispatch(getEntity(agentId));
      setLoadModal(true);
    } else if (isOpen) {
      dispatch(reset());
    }
  }, [isOpen, agentId, dispatch]);

  useEffect(() => {
    if (updateSuccess && loadModal) {
      setLoadModal(false);
      toggle();
      onDelete?.();
    }
  }, [updateSuccess, loadModal, toggle, onDelete]);

  const handleConfirmDelete = () => {
    if (agentEntity && agentEntity.id) {
      dispatch(deleteEntity(agentEntity.id));
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle} data-cy="agentDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="uptimeOApp.agent.delete.question">
        Are you sure you want to delete Agent <strong>{agentEntity?.name || agentEntity?.id}</strong>?
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle} disabled={updating}>
          <FontAwesomeIcon icon={faBan} />
          &nbsp; Cancel
        </Button>
        <Button
          id="jhi-confirm-delete-agent"
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

export default AgentDeleteModal;
