import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Nav } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faUsers, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from 'app/config/store';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import { AUTHORITIES } from 'app/config/constants';
import { useNavigate, useParams } from 'react-router-dom';
import ProfileTab from './tabs/profile-tab';
import SecurityTab from './tabs/security-tab';
import UserManagementTab from './tabs/user-management-tab';
import RoleManagementTab from './tabs/role-management-tab';
import './settings.scss';

export type SettingsTab = 'profile' | 'security' | 'user' | 'user-roles';

export const SettingsPage = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const account = useAppSelector(state => state.authentication.account);
  const isAdmin = useAppSelector(state => hasAnyAuthority(state.authentication.account.authorities, [AUTHORITIES.ADMIN]));

  useEffect(() => {
    if (tab && (tab === 'profile' || tab === 'security' || tab === 'user' || tab === 'user-roles')) {
      setActiveTab(tab as SettingsTab);
    } else {
      setActiveTab('profile');
    }
  }, [tab]);

  const handleTabChange = (newTab: SettingsTab) => {
    setActiveTab(newTab);
    navigate(`/account/settings/${newTab}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />;
      case 'security':
        return <SecurityTab />;
      case 'user':
        return <UserManagementTab />;
      case 'user-roles':
        return <RoleManagementTab />;
      default:
        return <ProfileTab />;
    }
  };

  return (
    <div className="settings-page">
      <Container fluid>
        <Row>
          {/* Sidebar Navigation */}
          <Col md={3} lg={2} className="settings-sidebar p-0">
            <div className="sidebar-header">
              <h4>Settings</h4>
              <p className="text-muted small">{account.login}</p>
            </div>
            <Nav vertical className="settings-nav">
              <button className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => handleTabChange('profile')}>
                <FontAwesomeIcon icon={faUser} className="me-2" />
                Profile
              </button>
              <button className={`nav-link ${activeTab === 'security' ? 'active' : ''}`} onClick={() => handleTabChange('security')}>
                <FontAwesomeIcon icon={faLock} className="me-2" />
                Security
              </button>

              {/* Admin Only Tabs */}
              {isAdmin && (
                <>
                  <div className="nav-section-divider">
                    <span className="text-muted small">ADMINISTRATION</span>
                  </div>
                  <button className={`nav-link ${activeTab === 'user' ? 'active' : ''}`} onClick={() => handleTabChange('user')}>
                    <FontAwesomeIcon icon={faUsers} className="me-2" />
                    User Management
                  </button>
                  <button
                    className={`nav-link ${activeTab === 'user-roles' ? 'active' : ''}`}
                    onClick={() => handleTabChange('user-roles')}
                  >
                    <FontAwesomeIcon icon={faUserShield} className="me-2" />
                    Role Management
                  </button>
                </>
              )}
            </Nav>
          </Col>

          {/* Main Content Area */}
          <Col md={9} lg={10} className="settings-content">
            {renderTabContent()}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SettingsPage;
