import React, { useEffect, useState } from 'react';
import { Button, Row, Col } from 'reactstrap';
import { ValidatedField, ValidatedForm, isEmail } from 'react-jhipster';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getSession } from 'app/shared/reducers/authentication';
import { reset, saveAccountSettings } from '../settings.reducer';

export const ProfileTab = () => {
  const dispatch = useAppDispatch();
  const account = useAppSelector(state => state.authentication.account);
  const successMessage = useAppSelector(state => state.settings.successMessage);

  useEffect(() => {
    dispatch(getSession());
    return () => {
      dispatch(reset());
    };
  }, []);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
    }
  }, [successMessage]);

  const handleValidSubmit = values => {
    dispatch(
      saveAccountSettings({
        ...account,
        ...values,
      }),
    );
  };

  // Don't render the form until account data is loaded
  if (!account || !account.login) {
    return (
      <div className="tab-content-wrapper">
        <h3>Profile Settings</h3>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="tab-content-wrapper">
      <h3>Profile Settings</h3>
      <p className="tab-description">Manage your personal information and account details.</p>

      <ValidatedForm
        key={account.login}
        id="settings-form"
        onSubmit={handleValidSubmit}
        defaultValues={{
          firstName: account.firstName,
          lastName: account.lastName,
          email: account.email,
          login: account.login,
        }}
      >
        <Row>
          <Col md={6}>
            <ValidatedField
              name="firstName"
              label="First Name"
              id="firstName"
              placeholder="Your first name"
              value={account.firstName}
              validate={{
                required: { value: true, message: 'Your first name is required.' },
                minLength: { value: 1, message: 'Your first name is required to be at least 1 character' },
                maxLength: { value: 50, message: 'Your first name cannot be longer than 50 characters' },
              }}
              data-cy="firstname"
            />
          </Col>
          <Col md={6}>
            <ValidatedField
              name="lastName"
              label="Last Name"
              id="lastName"
              placeholder="Your last name"
              value={account.lastName}
              validate={{
                required: { value: true, message: 'Your last name is required.' },
                minLength: { value: 1, message: 'Your last name is required to be at least 1 character' },
                maxLength: { value: 50, message: 'Your last name cannot be longer than 50 characters' },
              }}
              data-cy="lastname"
            />
          </Col>
        </Row>

        <ValidatedField
          name="email"
          label="Email Address"
          placeholder="Your email"
          type="email"
          value={account.email}
          validate={{
            required: { value: true, message: 'Your email is required.' },
            minLength: { value: 5, message: 'Your email is required to be at least 5 characters.' },
            maxLength: { value: 254, message: 'Your email cannot be longer than 254 characters.' },
            validate: v => isEmail(v) || 'Your email is invalid.',
          }}
          data-cy="email"
        />

        <ValidatedField
          name="login"
          label="Username"
          id="login"
          placeholder="Your username"
          value={account.login}
          disabled
          type="text"
          data-cy="username"
        />

        <div className="section-divider"></div>

        <div className="d-flex gap-2">
          <Button color="primary" type="submit" data-cy="submit">
            Save Changes
          </Button>
          <Button color="secondary" type="reset" outline>
            Cancel
          </Button>
        </div>
      </ValidatedForm>
    </div>
  );
};

export default ProfileTab;
