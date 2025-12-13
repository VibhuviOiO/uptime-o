import React from 'react';
import './http-heartbeat.scss';

interface HeartbeatDetailsProps {
  record: any;
  onClose: () => void;
}

const HeartbeatDetails: React.FC<HeartbeatDetailsProps> = ({ record, onClose }) => {
  const getStatusColor = () => {
    if (!record.success) return '#ef4444';
    if (record.responseTimeMs >= (record.criticalThresholdMs || 1000)) return '#f97316';
    if (record.responseTimeMs >= (record.warningThresholdMs || 500)) return '#fbbf24';
    return '#10b981';
  };

  const getStatusLabel = () => {
    if (!record.success) return 'Failed';
    if (record.responseTimeMs >= (record.criticalThresholdMs || 1000)) return 'Critical';
    if (record.responseTimeMs >= (record.warningThresholdMs || 500)) return 'Warning';
    return 'Healthy';
  };

  return (
    <div className="heartbeat-details">
      <div className="call-timestamp">{new Date(record.executedAt).toLocaleString()}</div>

      <div className="status-row">
        <div className="status-badge">
          <div className="status-dot" style={{ backgroundColor: getStatusColor() }}></div>
          <span>{getStatusLabel()}</span>
        </div>
        <span className="response-time">{record.responseTimeMs}ms response time</span>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <span className="info-label">Monitor</span>
          <div className="info-value">{record.monitor?.name || 'N/A'}</div>
        </div>
        <div className="info-card">
          <span className="info-label">Agent</span>
          <div className="info-value">{record.agent?.name || 'N/A'}</div>
        </div>
        <div className="info-card">
          <span className="info-label">HTTP Status</span>
          <div className="info-value">{record.responseStatusCode || 'N/A'}</div>
        </div>
        <div className="info-card">
          <span className="info-label">Response Size</span>
          <div className="info-value">{record.responseSizeBytes ? `${record.responseSizeBytes} bytes` : 'N/A'}</div>
        </div>
        <div className="info-card">
          <span className="info-label">Content Type</span>
          <div className="info-value small">{record.responseContentType || 'N/A'}</div>
        </div>
        <div className="info-card">
          <span className="info-label">Server</span>
          <div className="info-value">{record.responseServer || 'N/A'}</div>
        </div>
        <div className="info-card">
          <span className="info-label">Cache Status</span>
          <div className="info-value">{record.responseCacheStatus || 'N/A'}</div>
        </div>
      </div>

      {(record.dnsLookupMs || record.tcpConnectMs || record.tlsHandshakeMs || record.timeToFirstByteMs) && (
        <div className="timing-section">
          <h4 className="section-title">Timing Breakdown</h4>
          <div className="timing-grid">
            {record.dnsLookupMs !== undefined && (
              <div className="timing-card dns">
                <span className="timing-label">DNS Lookup</span>
                <div className="timing-value">{record.dnsLookupMs}ms</div>
              </div>
            )}
            {record.tcpConnectMs !== undefined && (
              <div className="timing-card tcp">
                <span className="timing-label">TCP Connect</span>
                <div className="timing-value">{record.tcpConnectMs}ms</div>
              </div>
            )}
            {record.tlsHandshakeMs !== undefined && (
              <div className="timing-card tls">
                <span className="timing-label">TLS Handshake</span>
                <div className="timing-value">{record.tlsHandshakeMs}ms</div>
              </div>
            )}
            {record.timeToFirstByteMs !== undefined && (
              <div className="timing-card ttfb">
                <span className="timing-label">Time to First Byte</span>
                <div className="timing-value">{record.timeToFirstByteMs}ms</div>
              </div>
            )}
          </div>
        </div>
      )}

      {record.errorMessage && (
        <div className="error-section">
          <h4 className="error-title">Error Details</h4>
          <div className="error-message">
            {record.errorType && <div className="error-type">{record.errorType}</div>}
            <div className="error-text">{record.errorMessage}</div>
          </div>
        </div>
      )}

      {record.rawResponseHeaders && (
        <div className="headers-section">
          <h4 className="section-title">Response Headers</h4>
          <div className="headers-content">
            <div className="headers-code">
              {(() => {
                try {
                  const headers =
                    typeof record.rawResponseHeaders === 'string' ? JSON.parse(record.rawResponseHeaders) : record.rawResponseHeaders;
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

      {record.rawResponseBody != null && record.rawResponseBody !== '' && (
        <div className="body-section">
          <h4 className="section-title">Response Body</h4>
          <div className="body-content">
            <pre className="body-code">
              {(() => {
                const body =
                  typeof record.rawResponseBody === 'string' ? record.rawResponseBody : JSON.stringify(record.rawResponseBody, null, 2);
                return body;
              })()}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeartbeatDetails;
