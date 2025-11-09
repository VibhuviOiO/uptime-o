import React, { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { deleteUser, getUser } from './user-management.reducer';

export const UserManagementDeleteDialog = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useParams<'login'>();

  useEffect(() => {
    dispatch(getUser(login));
  }, []);

  const handleClose = event => {
    event.stopPropagation();
    navigate(-1);
  };

  const user = useAppSelector(state => state.userManagement.user);

  const confirmDelete = async event => {
    await dispatch(deleteUser(user.login));
    navigate('/account/settings/user', { state: { refresh: Date.now() } });
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose}>Confirm delete operation</ModalHeader>
      <ModalBody>Are you sure you want to delete user {user.login}?</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default UserManagementDeleteDialog;
