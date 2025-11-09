import React, { useState, useEffect } from 'react';
import { Button, Alert } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { savePassword, reset } from 'app/modules/account/password/password.reducer';

export const SecurityTab = () => {
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const dispatch = useAppDispatch();

  const successMessage = useAppSelector(state => state.password.successMessage);
  const errorMessage = useAppSelector(state => state.password.errorMessage);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      // Reset form
      const form = document.getElementById('password-form') as HTMLFormElement;
      if (form) form.reset();
      setPasswordStrength(null);
      setPassword('');
      dispatch(reset());
    } else if (errorMessage) {
      toast.error(errorMessage);
      dispatch(reset());
    }
  }, [successMessage, errorMessage]);

  const checkPasswordStrength = (pwd: string): 'weak' | 'medium' | 'strong' => {
    if (!pwd) return 'weak';

    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
  };

  const handleValidSubmit = ({ currentPassword, newPassword, confirmPassword }) => {
    if (newPassword !== confirmPassword) {
      toast.error('The password and its confirmation do not match!');
      return;
    }

    // Temporary debug logging
    console.warn('SecurityTab - Submitting password change:', {
      currentPassword,
      currentPasswordLength: currentPassword?.length,
      newPassword,
      newPasswordLength: newPassword?.length,
    });

    dispatch(
      savePassword({
        currentPassword,
        newPassword,
      }),
    );
  };

  const updatePassword = event => {
    setPassword(event.target.value);
    setPasswordStrength(checkPasswordStrength(event.target.value));
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'strong':
        return 'success';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="tab-content-wrapper">
      <h3>Security Settings</h3>
      <p className="tab-description">Manage your account security and change your password.</p>

      <Alert color="info" className="mb-4">
        <strong>Password Requirements:</strong>
        <ul className="mb-0 mt-2">
          <li>At least 8 characters long</li>
          <li>Contains uppercase and lowercase letters</li>
          <li>Contains at least one number</li>
          <li>Contains at least one special character</li>
        </ul>
      </Alert>

      <ValidatedForm id="password-form" onSubmit={handleValidSubmit}>
        <ValidatedField
          name="currentPassword"
          label="Current Password"
          placeholder="Current password"
          type="password"
          validate={{
            required: { value: true, message: 'Your password is required.' },
          }}
          data-cy="currentPassword"
        />

        <div className="section-divider"></div>

        <div className="password-fields-row">
          <div className="password-field-col">
            <ValidatedField
              name="newPassword"
              label="New Password"
              placeholder="New password"
              type="password"
              onChange={updatePassword}
              validate={{
                required: { value: true, message: 'Your password is required.' },
                minLength: { value: 4, message: 'Your password is required to be at least 4 characters.' },
                maxLength: { value: 50, message: 'Your password cannot be longer than 50 characters.' },
              }}
              data-cy="newPassword"
            />
            {passwordStrength && (
              <div className="password-strength mt-2">
                <small className={`text-${getStrengthColor()}`}>
                  Password Strength: <strong className="text-uppercase">{passwordStrength}</strong>
                </small>
                <div className="progress" style={{ height: '4px' }}>
                  <div
                    className={`progress-bar bg-${getStrengthColor()}`}
                    role="progressbar"
                    style={{
                      width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%',
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          <div className="password-field-col">
            <ValidatedField
              name="confirmPassword"
              label="New password confirmation"
              placeholder="Confirm the new password"
              type="password"
              validate={{
                required: { value: true, message: 'Your confirmation password is required.' },
                minLength: { value: 4, message: 'Your confirmation password is required to be at least 4 characters.' },
                maxLength: { value: 50, message: 'Your confirmation password cannot be longer than 50 characters.' },
                validate: v => v === password || 'The password and its confirmation do not match!',
              }}
              data-cy="confirmPassword"
            />
          </div>
        </div>

        <div className="section-divider"></div>

        <div className="d-flex gap-2">
          <Button color="primary" type="submit" data-cy="submit">
            Update Password
          </Button>
          <Button color="secondary" type="reset" outline onClick={() => setPasswordStrength(null)}>
            Cancel
          </Button>
        </div>
      </ValidatedForm>
    </div>
  );
};

export default SecurityTab;
