import React, { useEffect } from 'react';
import { Alert } from 'reactstrap';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { savePassword, reset } from 'app/modules/account/password/password.reducer';
import PasswordChangeForm from 'app/shared/layout/password/password-change-form';

export const SecurityTab = () => {
  const dispatch = useAppDispatch();

  const successMessage = useAppSelector(state => state.password.successMessage);
  const errorMessage = useAppSelector(state => state.password.errorMessage);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      // Reset form
      const form = document.getElementById('password-form') as HTMLFormElement;
      if (form) form.reset();
      dispatch(reset());
    } else if (errorMessage) {
      toast.error(errorMessage);
      dispatch(reset());
    }
  }, [successMessage, errorMessage]);

  const handlePasswordSubmit = ({ currentPassword, newPassword }) => {
    dispatch(
      savePassword({
        currentPassword,
        newPassword,
      }),
    );
  };

  return (
    <div className="tab-content-wrapper">
      <h3>Security Settings</h3>
      <p className="tab-description">Manage your account security and change your password.</p>

      <Alert color="info" className="mb-4">
        <strong>Password Requirements:</strong>
        <ul className="mb-0 mt-2">
          <li>At least 4 characters long</li>
          <li>Maximum 50 characters</li>
        </ul>
      </Alert>

      <PasswordChangeForm onSubmit={handlePasswordSubmit} submitButtonText="Update Password" />
    </div>
  );
};

export default SecurityTab;
