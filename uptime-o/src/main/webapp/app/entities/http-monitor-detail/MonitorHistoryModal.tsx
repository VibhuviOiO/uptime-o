import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Badge } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './MonitorHistoryModal.scss';

interface TimeSeriesData {
  timestamp: string;
  agentName: string;
  agentRegion: string;
  success: boolean;
  responseTimeMs: number;
  responseStatusCode: number;
  errorType: string;
  errorMessage: string;
  responseSizeBytes?: number;
  responseServer?: string;
  responseCacheStatus?: string;
  dnsLookupMs?: number;
  dnsResolvedIp?: string;
  tcpConnectMs?: number;
  tlsHandshakeMs?: number;
  sslCertificateValid?: boolean;
  sslCertificateExpiry?: string;
  sslCertificateIssuer?: string;
  sslDaysUntilExpiry?: number;
  timeToFirstByteMs?: number;
  rawResponseHeaders?: any;
  rawResponseBody?: any;
}

interface MonitorHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: TimeSeriesData[];
  warningThresholdMs?: number;
  criticalThresholdMs?: number;
  agentName?: string;
}

const MonitorHistoryModal: React.FC<MonitorHistoryModalProps> = ({
  isOpen,
  onClose,
  records,
  warningThresholdMs = 500,
  criticalThresholdMs = 1000,
  agentName,
}) => {
  const [selectedRecord, setSelectedRecord] = useState<TimeSeriesData | null>(null);

  // Reset selected record when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedRecord(null);
    }
  }, [isOpen]);

  if (records.length === 0) return null;

  const getStatusColor = (record: TimeSeriesData) => {
    if (!record.success) {
      return '#ef4444'; // red
    } else if (record.responseTimeMs >= criticalThresholdMs) {
      return '#f97316'; // orange
    } else if (record.responseTimeMs >= warningThresholdMs) {
      return '#fbbf24'; // yellow
    } else {
      return '#10b981'; // green
    }
  };

  const getStatusLabel = (record: TimeSeriesData) => {
    if (!record.success) return 'Failed';
    if (record.responseTimeMs >= criticalThresholdMs) return 'Critical';
    if (record.responseTimeMs >= warningThresholdMs) return 'Warning';
    return 'Healthy';
  };

  const healthyCount = records.filter(r => r.success && r.responseTimeMs < warningThresholdMs).length;
  const warningCount = records.filter(
    r => r.success && r.responseTimeMs >= warningThresholdMs && r.responseTimeMs < criticalThresholdMs,
  ).length;
  const criticalCount = records.filter(r => r.success && r.responseTimeMs >= criticalThresholdMs).length;
  const failedCount = records.filter(r => !r.success).length;

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="xl" className="monitor-history-modal">
      <ModalHeader toggle={onClose}>
        <span className="modal-title">Monitoring History Details</span>
      </ModalHeader>
      <ModalBody>
        <div className="history-modal-content">
          {/* Legend and Instructions */}
          <div className="modal-header-section">
            <div className="instruction-text">Click on any square to view detailed information below</div>
            <div className="legend">
              <div className="legend-item">
                <div className="legend-dot healthy"></div>
                <span>Healthy</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot warning"></div>
                <span>Warning</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot critical"></div>
                <span>Critical</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot failed"></div>
                <span>Failed</span>
              </div>
            </div>
          </div>

          {/* Grid of colored squares */}
          <div className="squares-grid-container">
            <div className="squares-grid">
              {records
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((record, index) => {
                  const bgColor = getStatusColor(record);
                  const isSelected = selectedRecord?.timestamp === record.timestamp;
                  const callTime = new Date(record.timestamp);

                  return (
                    <div
                      key={index}
                      className={`status-square ${isSelected ? 'selected' : ''}`}
                      style={{ backgroundColor: bgColor }}
                      title={`${callTime.toLocaleString()} - ${record.responseTimeMs}ms`}
                      onClick={() => setSelectedRecord(record)}
                    >
                      {isSelected && (
                        <div className="selected-tooltip">
                          {callTime.toLocaleTimeString()} - {record.responseTimeMs}ms
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Summary stats */}
          <div className="summary-stats">
            <span className="total-checks">Total checks: {records.length}</span>
            <div className="status-counts">
              <div className="status-count healthy">
                <div className="count-dot"></div>
                <span>{healthyCount}</span>
              </div>
              <div className="status-count warning">
                <div className="count-dot"></div>
                <span>{warningCount}</span>
              </div>
              <div className="status-count critical">
                <div className="count-dot"></div>
                <span>{criticalCount}</span>
              </div>
              <div className="status-count failed">
                <div className="count-dot"></div>
                <span>{failedCount}</span>
              </div>
            </div>
          </div>

          {/* Selected Record Details */}
          {selectedRecord && (
            <div className="call-details">
              <h4 className="section-title">Call Details</h4>

              <div className="call-timestamp">{new Date(selectedRecord.timestamp).toLocaleString()}</div>

              <div className="status-row">
                <div className="status-badge">
                  <div className="status-dot" style={{ backgroundColor: getStatusColor(selectedRecord) }}></div>
                  <span>{getStatusLabel(selectedRecord)}</span>
                </div>
                <span className="response-time">{selectedRecord.responseTimeMs}ms response time</span>
              </div>

              {/* Basic Info Grid */}
              <div className="info-grid">
                <div className="info-card">
                  <span className="info-label">HTTP Status</span>
                  <div className="info-value">{selectedRecord.responseStatusCode || 'N/A'}</div>
                </div>
                <div className="info-card">
                  <span className="info-label">Response Size</span>
                  <div className="info-value">{selectedRecord.responseSizeBytes ? `${selectedRecord.responseSizeBytes} bytes` : 'N/A'}</div>
                </div>
                <div className="info-card">
                  <span className="info-label">Server</span>
                  <div className="info-value">{selectedRecord.responseServer || 'N/A'}</div>
                </div>
                <div className="info-card">
                  <span className="info-label">Cache Status</span>
                  <div className="info-value">{selectedRecord.responseCacheStatus || 'N/A'}</div>
                </div>
                {selectedRecord.dnsResolvedIp && (
                  <div className="info-card">
                    <span className="info-label">Resolved IP</span>
                    <div className="info-value">{selectedRecord.dnsResolvedIp}</div>
                  </div>
                )}
              </div>

              {/* SSL Certificate Info */}
              {selectedRecord.sslCertificateExpiry && (
                <div className="ssl-section">
                  <h4 className="section-title">SSL Certificate</h4>
                  <div className="info-grid">
                    <div className="info-card">
                      <span className="info-label">Status</span>
                      <div className="info-value">
                        <Badge
                          color={
                            !selectedRecord.sslCertificateValid
                              ? 'danger'
                              : selectedRecord.sslDaysUntilExpiry && selectedRecord.sslDaysUntilExpiry <= 7
                                ? 'danger'
                                : selectedRecord.sslDaysUntilExpiry && selectedRecord.sslDaysUntilExpiry <= 30
                                  ? 'warning'
                                  : 'success'
                          }
                        >
                          {!selectedRecord.sslCertificateValid
                            ? 'Invalid'
                            : selectedRecord.sslDaysUntilExpiry && selectedRecord.sslDaysUntilExpiry <= 7
                              ? 'Critical'
                              : selectedRecord.sslDaysUntilExpiry && selectedRecord.sslDaysUntilExpiry <= 30
                                ? 'Expiring Soon'
                                : 'Valid'}
                        </Badge>
                      </div>
                    </div>
                    <div className="info-card">
                      <span className="info-label">Expiry Date</span>
                      <div className="info-value">{new Date(selectedRecord.sslCertificateExpiry).toLocaleDateString()}</div>
                    </div>
                    <div className="info-card">
                      <span className="info-label">Days Until Expiry</span>
                      <div className="info-value">{selectedRecord.sslDaysUntilExpiry} days</div>
                    </div>
                    {selectedRecord.sslCertificateIssuer && (
                      <div className="info-card">
                        <span className="info-label">Issuer</span>
                        <div className="info-value">{selectedRecord.sslCertificateIssuer}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timing Breakdown */}
              {(selectedRecord.dnsLookupMs ||
                selectedRecord.tcpConnectMs ||
                selectedRecord.tlsHandshakeMs ||
                selectedRecord.timeToFirstByteMs) && (
                <div className="timing-section">
                  <h4 className="section-title">Timing Breakdown</h4>
                  <div className="timing-grid">
                    {selectedRecord.dnsLookupMs !== undefined && (
                      <div className="timing-card dns">
                        <span className="timing-label">DNS Lookup</span>
                        <div className="timing-value">{selectedRecord.dnsLookupMs}ms</div>
                      </div>
                    )}
                    {selectedRecord.tcpConnectMs !== undefined && (
                      <div className="timing-card tcp">
                        <span className="timing-label">TCP Connect</span>
                        <div className="timing-value">{selectedRecord.tcpConnectMs}ms</div>
                      </div>
                    )}
                    {selectedRecord.tlsHandshakeMs !== undefined && (
                      <div className="timing-card tls">
                        <span className="timing-label">TLS Handshake</span>
                        <div className="timing-value">{selectedRecord.tlsHandshakeMs}ms</div>
                      </div>
                    )}
                    {selectedRecord.timeToFirstByteMs !== undefined && (
                      <div className="timing-card ttfb">
                        <span className="timing-label">Time to First Byte</span>
                        <div className="timing-value">{selectedRecord.timeToFirstByteMs}ms</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Response Headers */}
              {selectedRecord.rawResponseHeaders && (
                <div className="headers-section">
                  <h4 className="section-title">Response Headers</h4>
                  <div className="headers-content">
                    <div className="headers-code">
                      {(() => {
                        try {
                          const headers =
                            typeof selectedRecord.rawResponseHeaders === 'string'
                              ? JSON.parse(selectedRecord.rawResponseHeaders)
                              : selectedRecord.rawResponseHeaders;
                          return Object.entries(headers).map(([key, value]) => (
                            <div key={key} className="header-line">
                              <span className="header-key">{key}:</span>
                              <span className="header-value">
                                {typeof value === 'object' && value !== null ? JSON.stringify(value) : (value as string)}
                              </span>
                            </div>
                          ));
                        } catch (e) {
                          return <div className="parse-error">Invalid headers format</div>;
                        }
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* Response Body */}
              {selectedRecord.rawResponseBody != null && selectedRecord.rawResponseBody !== '' && (
                <div className="body-section">
                  <h4 className="section-title">Response Body</h4>
                  <div className="body-content">
                    <pre className="body-code">
                      {(() => {
                        const body =
                          typeof selectedRecord.rawResponseBody === 'string'
                            ? selectedRecord.rawResponseBody
                            : JSON.stringify(selectedRecord.rawResponseBody, null, 2);
                        return body;
                      })()}
                    </pre>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {selectedRecord.errorMessage && (
                <div className="error-section">
                  <h4 className="error-title">Error Details</h4>
                  <div className="error-message">
                    <div className="error-type">{selectedRecord.errorType}</div>
                    <div className="error-text">{selectedRecord.errorMessage}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default MonitorHistoryModal;
