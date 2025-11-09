import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Nav } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faLock,
  faUsers,
  faUserShield,
  faKey,
  faGlobe,
  faBuilding,
  faClock,
  faRobot,
  faPalette,
} from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from 'app/config/store';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import { AUTHORITIES } from 'app/config/constants';
import { useNavigate, useParams } from 'react-router-dom';
import ProfileTab from './tabs/profile-tab';
import SecurityTab from './tabs/security-tab';
import UserManagementTab from './tabs/user-management-tab';
import RoleManagementTab from './tabs/role-management-tab';
import ApiKeyManagementTab from './tabs/api-key-management-tab';
import { RegionsTab } from './regions-tab';
import { DatacentersTab } from './datacenters-tab';
import { SchedulesTab } from './schedules-tab';
import { AgentsTab } from './agents-tab';
import BrandingTab from 'app/entities/branding/branding-tab';
import './settings.scss';

export type SettingsTab =
  | 'profile'
  | 'security'
  | 'regions'
  | 'datacenters'
  | 'schedules'
  | 'agents'
  | 'branding'
  | 'user'
  | 'user-roles'
  | 'api-keys';

export const SettingsPage = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const account = useAppSelector(state => state.authentication.account);
  const isAdmin = useAppSelector(state => hasAnyAuthority(state.authentication.account.authorities, [AUTHORITIES.ADMIN]));

  useEffect(() => {
    const validTabs = [
      'profile',
      'security',
      'regions',
      'datacenters',
      'schedules',
      'agents',
      'branding',
      'user',
      'user-roles',
      'api-keys',
    ];
    if (tab && validTabs.includes(tab)) {
      // Check if non-admin is trying to access admin-only tabs
      if (
        !isAdmin &&
        (tab === 'user' ||
          tab === 'user-roles' ||
          tab === 'api-keys' ||
          tab === 'regions' ||
          tab === 'datacenters' ||
          tab === 'schedules' ||
          tab === 'agents' ||
          tab === 'branding')
      ) {
        navigate('/account/settings/profile');
        return;
      }
      setActiveTab(tab as SettingsTab);
    } else {
      setActiveTab('profile');
    }
  }, [tab, isAdmin, navigate]);

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
      case 'regions':
        return isAdmin ? <RegionsTab /> : <ProfileTab />;
      case 'datacenters':
        return isAdmin ? <DatacentersTab /> : <ProfileTab />;
      case 'schedules':
        return isAdmin ? <SchedulesTab /> : <ProfileTab />;
      case 'agents':
        return isAdmin ? <AgentsTab /> : <ProfileTab />;
      case 'branding':
        return isAdmin ? <BrandingTab /> : <ProfileTab />;
      case 'user':
        return isAdmin ? <UserManagementTab /> : <ProfileTab />;
      case 'user-roles':
        return isAdmin ? <RoleManagementTab /> : <ProfileTab />;
      case 'api-keys':
        return isAdmin ? <ApiKeyManagementTab /> : <ProfileTab />;
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

              {/* Configuration Tabs */}
              {isAdmin && (
                <>
                  <div className="nav-section-divider">
                    <span className="text-muted small">⚙️ CONFIGURATION</span>
                  </div>
                  <button className={`nav-link ${activeTab === 'regions' ? 'active' : ''}`} onClick={() => handleTabChange('regions')}>
                    <FontAwesomeIcon icon={faGlobe} className="me-2" />
                    Regions
                  </button>
                  <button
                    className={`nav-link ${activeTab === 'datacenters' ? 'active' : ''}`}
                    onClick={() => handleTabChange('datacenters')}
                  >
                    <FontAwesomeIcon icon={faBuilding} className="me-2" />
                    Datacenters
                  </button>
                  <button className={`nav-link ${activeTab === 'schedules' ? 'active' : ''}`} onClick={() => handleTabChange('schedules')}>
                    <FontAwesomeIcon icon={faClock} className="me-2" />
                    Schedules
                  </button>
                  <button className={`nav-link ${activeTab === 'agents' ? 'active' : ''}`} onClick={() => handleTabChange('agents')}>
                    <FontAwesomeIcon icon={faRobot} className="me-2" />
                    Agents
                  </button>
                  <button className={`nav-link ${activeTab === 'branding' ? 'active' : ''}`} onClick={() => handleTabChange('branding')}>
                    <FontAwesomeIcon icon={faPalette} className="me-2" />
                    Branding
                  </button>
                </>
              )}

              {/* Admin Only Tabs */}
              {isAdmin && (
                <>
                  <div className="nav-section-divider">
                    <span className="text-muted small">👤 ADMINISTRATION</span>
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
                  <button className={`nav-link ${activeTab === 'api-keys' ? 'active' : ''}`} onClick={() => handleTabChange('api-keys')}>
                    <FontAwesomeIcon icon={faKey} className="me-2" />
                    API Keys
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
