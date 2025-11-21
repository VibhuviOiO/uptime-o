import React from 'react';
import { Link } from 'react-router-dom';
import { TextFormat } from 'react-jhipster';
import { Badge } from 'reactstrap';
import { APP_DATE_FORMAT } from 'app/config/constants';
import { IHttpHeartbeat } from 'app/shared/model/http-heartbeat.model';

const parseJSON = (jsonString: string | null) => {
  if (!jsonString) return null;
  try {
    return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
  } catch {
    return null;
  }
};

export const renderOverviewTab = (heartbeat: IHttpHeartbeat) => (
  <dl className="jh-entity-details">
    <dt>Executed At</dt>
    <dd>{heartbeat.executedAt ? <TextFormat value={heartbeat.executedAt.toDate()} type="date" format={APP_DATE_FORMAT} /> : null}</dd>
    <dt>Status Code</dt>
    <dd>
      <Badge color={heartbeat.responseStatusCode < 400 ? 'success' : 'danger'}>{heartbeat.responseStatusCode}</Badge>
    </dd>
    <dt>Response Time</dt>
    <dd>{heartbeat.responseTimeMs} ms</dd>
    <dt>Response Size</dt>
    <dd>{heartbeat.responseSizeBytes ? `${(heartbeat.responseSizeBytes / 1024).toFixed(2)} KB` : 'N/A'}</dd>
    {heartbeat.responseBodyUncompressedBytes && (
      <>
        <dt>Uncompressed Size</dt>
        <dd>{(heartbeat.responseBodyUncompressedBytes / 1024).toFixed(2)} KB</dd>
      </>
    )}
    {heartbeat.compressionRatio && (
      <>
        <dt>Compression Ratio</dt>
        <dd>{heartbeat.compressionRatio.toFixed(2)}x</dd>
      </>
    )}
    <dt>Content Type</dt>
    <dd>{heartbeat.responseContentType || 'N/A'}</dd>
    {heartbeat.httpVersion && (
      <>
        <dt>HTTP Version</dt>
        <dd>{heartbeat.httpVersion}</dd>
      </>
    )}
    <dt>Server</dt>
    <dd>{heartbeat.responseServer || 'N/A'}</dd>
    <dt>Monitor</dt>
    <dd>
      {heartbeat.monitor ? (
        <Link to={`/http-monitor/${heartbeat.monitor.id}`}>{heartbeat.monitor.name || heartbeat.monitor.id}</Link>
      ) : (
        'N/A'
      )}
    </dd>
    <dt>Agent</dt>
    <dd>{heartbeat.agent ? <Link to={`/agent/${heartbeat.agent.id}`}>{heartbeat.agent.name || heartbeat.agent.id}</Link> : 'N/A'}</dd>
    {heartbeat.errorType && (
      <>
        <dt>Error Type</dt>
        <dd>
          <Badge color="danger">{heartbeat.errorType}</Badge>
        </dd>
        <dt>Error Message</dt>
        <dd className="text-danger">{heartbeat.errorMessage}</dd>
      </>
    )}
  </dl>
);

export const renderTlsTab = (heartbeat: IHttpHeartbeat) => {
  const tls = parseJSON(heartbeat.tlsDetails);
  return (
    <dl className="jh-entity-details">
      <dt>TLS Handshake Time</dt>
      <dd>{heartbeat.tlsHandshakeMs ? `${heartbeat.tlsHandshakeMs} ms` : 'N/A'}</dd>
      <dt>Certificate Valid</dt>
      <dd>{heartbeat.sslCertificateValid ? <Badge color="success">Valid</Badge> : <Badge color="danger">Invalid</Badge>}</dd>
      {heartbeat.sslCertificateExpiry && (
        <>
          <dt>Certificate Expiry</dt>
          <dd>
            <TextFormat value={heartbeat.sslCertificateExpiry.toDate()} type="date" format={APP_DATE_FORMAT} />
          </dd>
          <dt>Days Until Expiry</dt>
          <dd>
            <Badge color={heartbeat.sslDaysUntilExpiry < 30 ? 'danger' : 'success'}>{heartbeat.sslDaysUntilExpiry} days</Badge>
          </dd>
        </>
      )}
      <dt>Certificate Issuer</dt>
      <dd>{heartbeat.sslCertificateIssuer || 'N/A'}</dd>
      {tls && (
        <>
          {tls.tls_version && (
            <>
              <dt>TLS Version</dt>
              <dd>{tls.tls_version}</dd>
            </>
          )}
          {tls.cipher && (
            <>
              <dt>Cipher Suite</dt>
              <dd>{tls.cipher}</dd>
            </>
          )}
          {tls.cert_subject && (
            <>
              <dt>Certificate Subject</dt>
              <dd>
                <pre>{JSON.stringify(tls.cert_subject, null, 2)}</pre>
              </dd>
            </>
          )}
          {tls.cert_chain_length && (
            <>
              <dt>Certificate Chain Length</dt>
              <dd>{tls.cert_chain_length}</dd>
            </>
          )}
          {tls.cert_fingerprint_sha256 && (
            <>
              <dt>Certificate Fingerprint (SHA256)</dt>
              <dd>
                <code>{tls.cert_fingerprint_sha256}</code>
              </dd>
            </>
          )}
        </>
      )}
    </dl>
  );
};

export const renderNetworkTab = (heartbeat: IHttpHeartbeat) => {
  const dns = parseJSON(heartbeat.dnsDetails);
  const path = parseJSON(heartbeat.networkPath);
  const redirect = parseJSON(heartbeat.redirectDetails);

  return (
    <dl className="jh-entity-details">
      <dt>DNS Lookup Time</dt>
      <dd>{heartbeat.dnsLookupMs ? `${heartbeat.dnsLookupMs} ms` : 'N/A'}</dd>
      <dt>Resolved IP</dt>
      <dd>{heartbeat.dnsResolvedIp || 'N/A'}</dd>
      {dns && (
        <>
          {dns.resolved_ips && (
            <>
              <dt>All Resolved IPs</dt>
              <dd>{dns.resolved_ips.join(', ')}</dd>
            </>
          )}
          {dns.record_types && (
            <>
              <dt>Record Types</dt>
              <dd>{dns.record_types.join(', ')}</dd>
            </>
          )}
          {dns.ttl && (
            <>
              <dt>TTL</dt>
              <dd>{dns.ttl} seconds</dd>
            </>
          )}
        </>
      )}
      <dt>TCP Connect Time</dt>
      <dd>{heartbeat.tcpConnectMs ? `${heartbeat.tcpConnectMs} ms` : 'N/A'}</dd>
      {path && Array.isArray(path) && (
        <>
          <dt>Network Path (Traceroute)</dt>
          <dd>
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Hop</th>
                  <th>IP</th>
                  <th>Latency</th>
                </tr>
              </thead>
              <tbody>
                {path.map((hop, i) => (
                  <tr key={i}>
                    <td>{hop.hop}</td>
                    <td>{hop.ip}</td>
                    <td>{hop.latency_ms} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </dd>
        </>
      )}
      {redirect && (
        <>
          <dt>Redirect Count</dt>
          <dd>{redirect.redirect_count}</dd>
          {redirect.redirect_chain && (
            <>
              <dt>Redirect Chain</dt>
              <dd>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>URL</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redirect.redirect_chain.map((r, i) => (
                      <tr key={i}>
                        <td>{r.url}</td>
                        <td>
                          <Badge>{r.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </dd>
            </>
          )}
        </>
      )}
    </dl>
  );
};

export const renderPerformanceTab = (heartbeat: IHttpHeartbeat) => {
  const phases = parseJSON(heartbeat.phaseLatencies);
  return (
    <dl className="jh-entity-details">
      <dt>Total Response Time</dt>
      <dd>{heartbeat.responseTimeMs} ms</dd>
      <dt>Time to First Byte</dt>
      <dd>{heartbeat.timeToFirstByteMs ? `${heartbeat.timeToFirstByteMs} ms` : 'N/A'}</dd>
      {phases && (
        <>
          {phases.dns && (
            <>
              <dt>DNS Lookup</dt>
              <dd>{phases.dns} ms</dd>
            </>
          )}
          {phases.tcp && (
            <>
              <dt>TCP Connect</dt>
              <dd>{phases.tcp} ms</dd>
            </>
          )}
          {phases.tls && (
            <>
              <dt>TLS Handshake</dt>
              <dd>{phases.tls} ms</dd>
            </>
          )}
          {phases.server_processing && (
            <>
              <dt>Server Processing</dt>
              <dd>{phases.server_processing} ms</dd>
            </>
          )}
          {phases.download && (
            <>
              <dt>Download Time</dt>
              <dd>{phases.download} ms</dd>
            </>
          )}
        </>
      )}
      <dt>Warning Threshold</dt>
      <dd>{heartbeat.warningThresholdMs ? `${heartbeat.warningThresholdMs} ms` : 'N/A'}</dd>
      <dt>Critical Threshold</dt>
      <dd>{heartbeat.criticalThresholdMs ? `${heartbeat.criticalThresholdMs} ms` : 'N/A'}</dd>
    </dl>
  );
};

export const renderHeadersTab = (heartbeat: IHttpHeartbeat) => (
  <>
    <h5>Request Headers</h5>
    <pre className="bg-light p-3">
      {heartbeat.rawRequestHeaders ? JSON.stringify(parseJSON(heartbeat.rawRequestHeaders), null, 2) : 'No request headers'}
    </pre>
    <h5 className="mt-3">Response Headers</h5>
    <pre className="bg-light p-3">
      {heartbeat.rawResponseHeaders ? JSON.stringify(parseJSON(heartbeat.rawResponseHeaders), null, 2) : 'No response headers'}
    </pre>
  </>
);

export const renderBodyTab = (heartbeat: IHttpHeartbeat) => (
  <>
    <dl className="jh-entity-details">
      {heartbeat.responseBodyHash && (
        <>
          <dt>Body Hash (SHA256)</dt>
          <dd>
            <code>{heartbeat.responseBodyHash}</code>
          </dd>
        </>
      )}
      {heartbeat.responseBodyValid !== null && (
        <>
          <dt>Body Valid</dt>
          <dd>{heartbeat.responseBodyValid ? <Badge color="success">Valid</Badge> : <Badge color="danger">Invalid</Badge>}</dd>
        </>
      )}
      {heartbeat.responseBodySample && (
        <>
          <dt>Body Sample (First 500 chars)</dt>
          <dd>
            <pre className="bg-light p-3">{heartbeat.responseBodySample}</pre>
          </dd>
        </>
      )}
    </dl>
    <h5>Full Response Body</h5>
    <pre className="bg-light p-3" style={{ maxHeight: '400px', overflow: 'auto' }}>
      {heartbeat.rawResponseBody ? JSON.stringify(parseJSON(heartbeat.rawResponseBody), null, 2) : 'No response body'}
    </pre>
  </>
);

export const renderCacheTab = (heartbeat: IHttpHeartbeat) => {
  const rateLimit = parseJSON(heartbeat.rateLimitDetails);
  return (
    <dl className="jh-entity-details">
      <dt>Cache Status</dt>
      <dd>{heartbeat.responseCacheStatus || 'N/A'}</dd>
      {heartbeat.cacheControl && (
        <>
          <dt>Cache-Control</dt>
          <dd>{heartbeat.cacheControl}</dd>
        </>
      )}
      {heartbeat.etag && (
        <>
          <dt>ETag</dt>
          <dd>
            <code>{heartbeat.etag}</code>
          </dd>
        </>
      )}
      {heartbeat.cacheAge !== null && (
        <>
          <dt>Cache Age</dt>
          <dd>{heartbeat.cacheAge} seconds</dd>
        </>
      )}
      {heartbeat.cdnProvider && (
        <>
          <dt>CDN Provider</dt>
          <dd>
            <Badge color="info">{heartbeat.cdnProvider}</Badge>
          </dd>
        </>
      )}
      {heartbeat.cdnPop && (
        <>
          <dt>CDN POP Location</dt>
          <dd>{heartbeat.cdnPop}</dd>
        </>
      )}
      {heartbeat.contentEncoding && (
        <>
          <dt>Content Encoding</dt>
          <dd>{heartbeat.contentEncoding}</dd>
        </>
      )}
      {heartbeat.transferEncoding && (
        <>
          <dt>Transfer Encoding</dt>
          <dd>{heartbeat.transferEncoding}</dd>
        </>
      )}
      {rateLimit && (
        <>
          {rateLimit.limit && (
            <>
              <dt>Rate Limit</dt>
              <dd>{rateLimit.limit} requests</dd>
            </>
          )}
          {rateLimit.remaining !== undefined && (
            <>
              <dt>Remaining Requests</dt>
              <dd>
                <Badge color={rateLimit.remaining < 100 ? 'warning' : 'success'}>{rateLimit.remaining}</Badge>
              </dd>
            </>
          )}
          {rateLimit.reset && (
            <>
              <dt>Reset Time</dt>
              <dd>{new Date(rateLimit.reset * 1000).toLocaleString()}</dd>
            </>
          )}
        </>
      )}
    </dl>
  );
};

export const renderSystemTab = (heartbeat: IHttpHeartbeat) => {
  const metrics = parseJSON(heartbeat.agentMetrics);
  if (!metrics) return <p>No system metrics available</p>;

  return (
    <dl className="jh-entity-details">
      {metrics.cpu_percent !== undefined && (
        <>
          <dt>CPU Usage</dt>
          <dd>{metrics.cpu_percent.toFixed(2)}%</dd>
        </>
      )}
      {metrics.memory_percent !== undefined && (
        <>
          <dt>Memory Usage</dt>
          <dd>{metrics.memory_percent.toFixed(2)}%</dd>
        </>
      )}
      {metrics.bytes_sent && (
        <>
          <dt>Network Sent</dt>
          <dd>{(metrics.bytes_sent / 1024 / 1024).toFixed(2)} MB</dd>
        </>
      )}
      {metrics.bytes_recv && (
        <>
          <dt>Network Received</dt>
          <dd>{(metrics.bytes_recv / 1024 / 1024).toFixed(2)} MB</dd>
        </>
      )}
      {metrics.disk_io_read_bytes && (
        <>
          <dt>Disk Read</dt>
          <dd>{(metrics.disk_io_read_bytes / 1024 / 1024 / 1024).toFixed(2)} GB</dd>
        </>
      )}
      {metrics.disk_io_write_bytes && (
        <>
          <dt>Disk Write</dt>
          <dd>{(metrics.disk_io_write_bytes / 1024 / 1024 / 1024).toFixed(2)} GB</dd>
        </>
      )}
      {metrics.load_avg && Array.isArray(metrics.load_avg) && (
        <>
          <dt>Load Average</dt>
          <dd>{metrics.load_avg.join(', ')}</dd>
        </>
      )}
    </dl>
  );
};
