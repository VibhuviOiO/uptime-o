import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Col, Row, Nav, NavItem, NavLink, TabContent, TabPane, Badge } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntity } from './http-heartbeat.reducer';
import {
  renderOverviewTab,
  renderTlsTab,
  renderNetworkTab,
  renderPerformanceTab,
  renderHeadersTab,
  renderBodyTab,
  renderCacheTab,
  renderSystemTab,
} from './tabs/renderTabs';

export const HttpHeartbeatDetail = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams<'id'>();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const apiHeartbeatEntity = useAppSelector(state => state.apiHeartbeat.entity);

  return (
    <Row>
      <Col md="12">
        <h2 data-cy="apiHeartbeatDetailsHeading">
          HTTP Heartbeat Details
          {apiHeartbeatEntity.success ? (
            <Badge color="success" className="ms-2">
              Success
            </Badge>
          ) : (
            <Badge color="danger" className="ms-2">
              Failed
            </Badge>
          )}
        </h2>

        <Nav tabs className="mb-3">
          <NavItem>
            <NavLink active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} style={{ cursor: 'pointer' }}>
              <FontAwesomeIcon icon="chart-line" /> Overview
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink active={activeTab === 'tls'} onClick={() => setActiveTab('tls')} style={{ cursor: 'pointer' }}>
              <FontAwesomeIcon icon="lock" /> TLS/SSL
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink active={activeTab === 'network'} onClick={() => setActiveTab('network')} style={{ cursor: 'pointer' }}>
              <FontAwesomeIcon icon="network-wired" /> Network
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink active={activeTab === 'performance'} onClick={() => setActiveTab('performance')} style={{ cursor: 'pointer' }}>
              <FontAwesomeIcon icon="tachometer-alt" /> Performance
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink active={activeTab === 'headers'} onClick={() => setActiveTab('headers')} style={{ cursor: 'pointer' }}>
              <FontAwesomeIcon icon="list" /> Headers
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink active={activeTab === 'body'} onClick={() => setActiveTab('body')} style={{ cursor: 'pointer' }}>
              <FontAwesomeIcon icon="file-code" /> Body
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink active={activeTab === 'cache'} onClick={() => setActiveTab('cache')} style={{ cursor: 'pointer' }}>
              <FontAwesomeIcon icon="database" /> Cache & CDN
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink active={activeTab === 'system'} onClick={() => setActiveTab('system')} style={{ cursor: 'pointer' }}>
              <FontAwesomeIcon icon="server" /> System
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={activeTab}>
          <TabPane tabId="overview">{renderOverviewTab(apiHeartbeatEntity)}</TabPane>
          <TabPane tabId="tls">{renderTlsTab(apiHeartbeatEntity)}</TabPane>
          <TabPane tabId="network">{renderNetworkTab(apiHeartbeatEntity)}</TabPane>
          <TabPane tabId="performance">{renderPerformanceTab(apiHeartbeatEntity)}</TabPane>
          <TabPane tabId="headers">{renderHeadersTab(apiHeartbeatEntity)}</TabPane>
          <TabPane tabId="body">{renderBodyTab(apiHeartbeatEntity)}</TabPane>
          <TabPane tabId="cache">{renderCacheTab(apiHeartbeatEntity)}</TabPane>
          <TabPane tabId="system">{renderSystemTab(apiHeartbeatEntity)}</TabPane>
        </TabContent>

        <div className="mt-3">
          <Button tag={Link} to="/http-heartbeats" replace color="info" data-cy="entityDetailsBackButton">
            <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
          </Button>
        </div>
      </Col>
    </Row>
  );
};

export default HttpHeartbeatDetail;
