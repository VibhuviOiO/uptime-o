import React, { useState } from 'react';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { Button } from 'reactstrap';
import PasswordStrengthBar from 'app/shared/layout/password/password-strength-bar';

interface PasswordChangeFormProps {
  onSubmit: (data: { currentPassword: string; newPassword: string }) => void;
  submitButtonText?: string;
  showCurrentPassword?: boolean;
}

export const PasswordChangeForm = ({ onSubmit, submitButtonText = 'Save', showCurrentPassword = true }: PasswordChangeFormProps) => {
  const [password, setPassword] = useState('');

  const handleValidSubmit = (data: { currentPassword?: string; newPassword: string; confirmPassword: string }) => {
    const { currentPassword, newPassword } = data;
    onSubmit({ currentPassword: currentPassword || '', newPassword });
  };

  const updatePassword = (event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value);

  return (
    <ValidatedForm id="password-form" onSubmit={handleValidSubmit}>
      {showCurrentPassword && (
        <ValidatedField
          name="currentPassword"
          label="Current password"
          placeholder="Current password"
          type="password"
          validate={{
            required: { value: true, message: 'Your password is required.' },
          }}
          data-cy="currentPassword"
        />
      )}
      <ValidatedField
        name="newPassword"
        label="New password"
        placeholder="New password"
        type="password"
        validate={{
          required: { value: true, message: 'Your password is required.' },
          minLength: { value: 4, message: 'Your password is required to be at least 4 characters.' },
          maxLength: { value: 50, message: 'Your password cannot be longer than 50 characters.' },
        }}
        onChange={updatePassword}
        data-cy="newPassword"
      />
      <PasswordStrengthBar password={password} />
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
      <Button color="success" type="submit" data-cy="submit">
        {submitButtonText}
      </Button>
    </ValidatedForm>
  );
};

export default PasswordChangeForm;
