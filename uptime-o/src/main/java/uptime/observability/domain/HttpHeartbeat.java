package uptime.observability.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Type;

/**
 * A HttpHeartbeat.
 */
@Entity
@Table(name = "http_heartbeats")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class HttpHeartbeat implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "executed_at", nullable = false)
    private Instant executedAt;

    @Column(name = "success")
    private Boolean success;

    @Column(name = "response_time_ms")
    private Integer responseTimeMs;

    @Column(name = "response_size_bytes")
    private Integer responseSizeBytes;

    @Column(name = "response_status_code")
    private Integer responseStatusCode;

    @Size(max = 50)
    @Column(name = "response_content_type", length = 50)
    private String responseContentType;

    @Size(max = 50)
    @Column(name = "response_server", length = 50)
    private String responseServer;

    @Size(max = 50)
    @Column(name = "response_cache_status", length = 50)
    private String responseCacheStatus;

    @Column(name = "dns_lookup_ms")
    private Integer dnsLookupMs;

    @Size(max = 100)
    @Column(name = "dns_resolved_ip", length = 100)
    private String dnsResolvedIp;

    @Column(name = "tcp_connect_ms")
    private Integer tcpConnectMs;

    @Column(name = "tls_handshake_ms")
    private Integer tlsHandshakeMs;

    @Column(name = "ssl_certificate_valid")
    private Boolean sslCertificateValid;

    @Column(name = "ssl_certificate_expiry")
    private Instant sslCertificateExpiry;

    @Size(max = 500)
    @Column(name = "ssl_certificate_issuer", length = 500)
    private String sslCertificateIssuer;

    @Column(name = "ssl_days_until_expiry")
    private Integer sslDaysUntilExpiry;

    @Column(name = "time_to_first_byte_ms")
    private Integer timeToFirstByteMs;

    @Column(name = "warning_threshold_ms")
    private Integer warningThresholdMs;

    @Column(name = "critical_threshold_ms")
    private Integer criticalThresholdMs;

    @Size(max = 50)
    @Column(name = "error_type", length = 50)
    private String errorType;

    @Column(name = "error_message", columnDefinition = "text")
    private String errorMessage;

    @Column(name = "raw_request_headers", columnDefinition = "jsonb")
    @Type(JsonNodeType.class)
    private JsonNode rawRequestHeaders;

    @Column(name = "raw_response_headers", columnDefinition = "jsonb")
    @Type(JsonNodeType.class)
    private JsonNode rawResponseHeaders;

    @Column(name = "raw_response_body", columnDefinition = "jsonb")
    @Type(JsonNodeType.class)
    private JsonNode rawResponseBody;

    // Phase 2 Enhancement Fields
    @Column(name = "dns_details", columnDefinition = "jsonb")
    @Type(JsonNodeType.class)
    private JsonNode dnsDetails;

    @Column(name = "tls_details", columnDefinition = "jsonb")
    @Type(JsonNodeType.class)
    private JsonNode tlsDetails;

    @Size(max = 10)
    @Column(name = "http_version", length = 10)
    private String httpVersion;

    @Size(max = 20)
    @Column(name = "content_encoding", length = 20)
    private String contentEncoding;

    @Column(name = "compression_ratio")
    private Float compressionRatio;

    @Size(max = 20)
    @Column(name = "transfer_encoding", length = 20)
    private String transferEncoding;

    @Size(max = 64)
    @Column(name = "response_body_hash", length = 64)
    private String responseBodyHash;

    @Column(name = "response_body_sample", columnDefinition = "text")
    private String responseBodySample;

    @Column(name = "response_body_valid")
    private Boolean responseBodyValid;

    @Column(name = "response_body_uncompressed_bytes")
    private Integer responseBodyUncompressedBytes;

    @Column(name = "redirect_details", columnDefinition = "jsonb")
    @Type(JsonNodeType.class)
    private JsonNode redirectDetails;

    @Size(max = 255)
    @Column(name = "cache_control", length = 255)
    private String cacheControl;

    @Size(max = 255)
    @Column(name = "etag", length = 255)
    private String etag;

    @Column(name = "cache_age")
    private Integer cacheAge;

    @Size(max = 50)
    @Column(name = "cdn_provider", length = 50)
    private String cdnProvider;

    @Size(max = 10)
    @Column(name = "cdn_pop", length = 10)
    private String cdnPop;

    @Column(name = "rate_limit_details", columnDefinition = "jsonb")
    @Type(JsonNodeType.class)
    private JsonNode rateLimitDetails;

    @Column(name = "network_path", columnDefinition = "jsonb")
    @Type(JsonNodeType.class)
    private JsonNode networkPath;

    @Column(name = "agent_metrics", columnDefinition = "jsonb")
    @Type(JsonNodeType.class)
    private JsonNode agentMetrics;

    @Column(name = "phase_latencies", columnDefinition = "jsonb")
    @Type(JsonNodeType.class)
    private JsonNode phaseLatencies;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "apiHeartbeats", "agentMonitors", "schedule" }, allowSetters = true)
    private HttpMonitor monitor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "apiHeartbeats", "agentMonitors", "datacenter" }, allowSetters = true)
    private Agent agent;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public HttpHeartbeat id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getExecutedAt() {
        return this.executedAt;
    }

    public HttpHeartbeat executedAt(Instant executedAt) {
        this.setExecutedAt(executedAt);
        return this;
    }

    public void setExecutedAt(Instant executedAt) {
        this.executedAt = executedAt;
    }

    public Boolean getSuccess() {
        return this.success;
    }

    public HttpHeartbeat success(Boolean success) {
        this.setSuccess(success);
        return this;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public Integer getResponseTimeMs() {
        return this.responseTimeMs;
    }

    public HttpHeartbeat responseTimeMs(Integer responseTimeMs) {
        this.setResponseTimeMs(responseTimeMs);
        return this;
    }

    public void setResponseTimeMs(Integer responseTimeMs) {
        this.responseTimeMs = responseTimeMs;
    }

    public Integer getResponseSizeBytes() {
        return this.responseSizeBytes;
    }

    public HttpHeartbeat responseSizeBytes(Integer responseSizeBytes) {
        this.setResponseSizeBytes(responseSizeBytes);
        return this;
    }

    public void setResponseSizeBytes(Integer responseSizeBytes) {
        this.responseSizeBytes = responseSizeBytes;
    }

    public Integer getResponseStatusCode() {
        return this.responseStatusCode;
    }

    public HttpHeartbeat responseStatusCode(Integer responseStatusCode) {
        this.setResponseStatusCode(responseStatusCode);
        return this;
    }

    public void setResponseStatusCode(Integer responseStatusCode) {
        this.responseStatusCode = responseStatusCode;
    }

    public String getResponseContentType() {
        return this.responseContentType;
    }

    public HttpHeartbeat responseContentType(String responseContentType) {
        this.setResponseContentType(responseContentType);
        return this;
    }

    public void setResponseContentType(String responseContentType) {
        this.responseContentType = responseContentType;
    }

    public String getResponseServer() {
        return this.responseServer;
    }

    public HttpHeartbeat responseServer(String responseServer) {
        this.setResponseServer(responseServer);
        return this;
    }

    public void setResponseServer(String responseServer) {
        this.responseServer = responseServer;
    }

    public String getResponseCacheStatus() {
        return this.responseCacheStatus;
    }

    public HttpHeartbeat responseCacheStatus(String responseCacheStatus) {
        this.setResponseCacheStatus(responseCacheStatus);
        return this;
    }

    public void setResponseCacheStatus(String responseCacheStatus) {
        this.responseCacheStatus = responseCacheStatus;
    }

    public Integer getDnsLookupMs() {
        return this.dnsLookupMs;
    }

    public HttpHeartbeat dnsLookupMs(Integer dnsLookupMs) {
        this.setDnsLookupMs(dnsLookupMs);
        return this;
    }

    public void setDnsLookupMs(Integer dnsLookupMs) {
        this.dnsLookupMs = dnsLookupMs;
    }

    public String getDnsResolvedIp() {
        return this.dnsResolvedIp;
    }

    public HttpHeartbeat dnsResolvedIp(String dnsResolvedIp) {
        this.setDnsResolvedIp(dnsResolvedIp);
        return this;
    }

    public void setDnsResolvedIp(String dnsResolvedIp) {
        this.dnsResolvedIp = dnsResolvedIp;
    }

    public Integer getTcpConnectMs() {
        return this.tcpConnectMs;
    }

    public HttpHeartbeat tcpConnectMs(Integer tcpConnectMs) {
        this.setTcpConnectMs(tcpConnectMs);
        return this;
    }

    public void setTcpConnectMs(Integer tcpConnectMs) {
        this.tcpConnectMs = tcpConnectMs;
    }

    public Integer getTlsHandshakeMs() {
        return this.tlsHandshakeMs;
    }

    public HttpHeartbeat tlsHandshakeMs(Integer tlsHandshakeMs) {
        this.setTlsHandshakeMs(tlsHandshakeMs);
        return this;
    }

    public void setTlsHandshakeMs(Integer tlsHandshakeMs) {
        this.tlsHandshakeMs = tlsHandshakeMs;
    }

    public Boolean getSslCertificateValid() {
        return this.sslCertificateValid;
    }

    public HttpHeartbeat sslCertificateValid(Boolean sslCertificateValid) {
        this.setSslCertificateValid(sslCertificateValid);
        return this;
    }

    public void setSslCertificateValid(Boolean sslCertificateValid) {
        this.sslCertificateValid = sslCertificateValid;
    }

    public Instant getSslCertificateExpiry() {
        return this.sslCertificateExpiry;
    }

    public HttpHeartbeat sslCertificateExpiry(Instant sslCertificateExpiry) {
        this.setSslCertificateExpiry(sslCertificateExpiry);
        return this;
    }

    public void setSslCertificateExpiry(Instant sslCertificateExpiry) {
        this.sslCertificateExpiry = sslCertificateExpiry;
    }

    public String getSslCertificateIssuer() {
        return this.sslCertificateIssuer;
    }

    public HttpHeartbeat sslCertificateIssuer(String sslCertificateIssuer) {
        this.setSslCertificateIssuer(sslCertificateIssuer);
        return this;
    }

    public void setSslCertificateIssuer(String sslCertificateIssuer) {
        this.sslCertificateIssuer = sslCertificateIssuer;
    }

    public Integer getSslDaysUntilExpiry() {
        return this.sslDaysUntilExpiry;
    }

    public HttpHeartbeat sslDaysUntilExpiry(Integer sslDaysUntilExpiry) {
        this.setSslDaysUntilExpiry(sslDaysUntilExpiry);
        return this;
    }

    public void setSslDaysUntilExpiry(Integer sslDaysUntilExpiry) {
        this.sslDaysUntilExpiry = sslDaysUntilExpiry;
    }

    public Integer getTimeToFirstByteMs() {
        return this.timeToFirstByteMs;
    }

    public HttpHeartbeat timeToFirstByteMs(Integer timeToFirstByteMs) {
        this.setTimeToFirstByteMs(timeToFirstByteMs);
        return this;
    }

    public void setTimeToFirstByteMs(Integer timeToFirstByteMs) {
        this.timeToFirstByteMs = timeToFirstByteMs;
    }

    public Integer getWarningThresholdMs() {
        return this.warningThresholdMs;
    }

    public HttpHeartbeat warningThresholdMs(Integer warningThresholdMs) {
        this.setWarningThresholdMs(warningThresholdMs);
        return this;
    }

    public void setWarningThresholdMs(Integer warningThresholdMs) {
        this.warningThresholdMs = warningThresholdMs;
    }

    public Integer getCriticalThresholdMs() {
        return this.criticalThresholdMs;
    }

    public HttpHeartbeat criticalThresholdMs(Integer criticalThresholdMs) {
        this.setCriticalThresholdMs(criticalThresholdMs);
        return this;
    }

    public void setCriticalThresholdMs(Integer criticalThresholdMs) {
        this.criticalThresholdMs = criticalThresholdMs;
    }

    public String getErrorType() {
        return this.errorType;
    }

    public HttpHeartbeat errorType(String errorType) {
        this.setErrorType(errorType);
        return this;
    }

    public void setErrorType(String errorType) {
        this.errorType = errorType;
    }

    public String getErrorMessage() {
        return this.errorMessage;
    }

    public HttpHeartbeat errorMessage(String errorMessage) {
        this.setErrorMessage(errorMessage);
        return this;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public JsonNode getRawRequestHeaders() {
        return this.rawRequestHeaders;
    }

    public HttpHeartbeat rawRequestHeaders(JsonNode rawRequestHeaders) {
        this.setRawRequestHeaders(rawRequestHeaders);
        return this;
    }

    public void setRawRequestHeaders(JsonNode rawRequestHeaders) {
        this.rawRequestHeaders = rawRequestHeaders;
    }

    public JsonNode getRawResponseHeaders() {
        return this.rawResponseHeaders;
    }

    public HttpHeartbeat rawResponseHeaders(JsonNode rawResponseHeaders) {
        this.setRawResponseHeaders(rawResponseHeaders);
        return this;
    }

    public void setRawResponseHeaders(JsonNode rawResponseHeaders) {
        this.rawResponseHeaders = rawResponseHeaders;
    }

    public JsonNode getRawResponseBody() {
        return this.rawResponseBody;
    }

    public HttpHeartbeat rawResponseBody(JsonNode rawResponseBody) {
        this.setRawResponseBody(rawResponseBody);
        return this;
    }

    public void setRawResponseBody(JsonNode rawResponseBody) {
        this.rawResponseBody = rawResponseBody;
    }

    public HttpMonitor getMonitor() {
        return this.monitor;
    }

    public void setMonitor(HttpMonitor apiMonitor) {
        this.monitor = apiMonitor;
    }

    public HttpHeartbeat monitor(HttpMonitor apiMonitor) {
        this.setMonitor(apiMonitor);
        return this;
    }

    public Agent getAgent() {
        return this.agent;
    }

    public void setAgent(Agent agent) {
        this.agent = agent;
    }

    public HttpHeartbeat agent(Agent agent) {
        this.setAgent(agent);
        return this;
    }

    // Phase 2 Enhancement Getters and Setters
    public JsonNode getDnsDetails() {
        return this.dnsDetails;
    }

    public HttpHeartbeat dnsDetails(JsonNode dnsDetails) {
        this.setDnsDetails(dnsDetails);
        return this;
    }

    public void setDnsDetails(JsonNode dnsDetails) {
        this.dnsDetails = dnsDetails;
    }

    public JsonNode getTlsDetails() {
        return this.tlsDetails;
    }

    public HttpHeartbeat tlsDetails(JsonNode tlsDetails) {
        this.setTlsDetails(tlsDetails);
        return this;
    }

    public void setTlsDetails(JsonNode tlsDetails) {
        this.tlsDetails = tlsDetails;
    }

    public String getHttpVersion() {
        return this.httpVersion;
    }

    public HttpHeartbeat httpVersion(String httpVersion) {
        this.setHttpVersion(httpVersion);
        return this;
    }

    public void setHttpVersion(String httpVersion) {
        this.httpVersion = httpVersion;
    }

    public String getContentEncoding() {
        return this.contentEncoding;
    }

    public HttpHeartbeat contentEncoding(String contentEncoding) {
        this.setContentEncoding(contentEncoding);
        return this;
    }

    public void setContentEncoding(String contentEncoding) {
        this.contentEncoding = contentEncoding;
    }

    public Float getCompressionRatio() {
        return this.compressionRatio;
    }

    public HttpHeartbeat compressionRatio(Float compressionRatio) {
        this.setCompressionRatio(compressionRatio);
        return this;
    }

    public void setCompressionRatio(Float compressionRatio) {
        this.compressionRatio = compressionRatio;
    }

    public String getTransferEncoding() {
        return this.transferEncoding;
    }

    public HttpHeartbeat transferEncoding(String transferEncoding) {
        this.setTransferEncoding(transferEncoding);
        return this;
    }

    public void setTransferEncoding(String transferEncoding) {
        this.transferEncoding = transferEncoding;
    }

    public String getResponseBodyHash() {
        return this.responseBodyHash;
    }

    public HttpHeartbeat responseBodyHash(String responseBodyHash) {
        this.setResponseBodyHash(responseBodyHash);
        return this;
    }

    public void setResponseBodyHash(String responseBodyHash) {
        this.responseBodyHash = responseBodyHash;
    }

    public String getResponseBodySample() {
        return this.responseBodySample;
    }

    public HttpHeartbeat responseBodySample(String responseBodySample) {
        this.setResponseBodySample(responseBodySample);
        return this;
    }

    public void setResponseBodySample(String responseBodySample) {
        this.responseBodySample = responseBodySample;
    }

    public Boolean getResponseBodyValid() {
        return this.responseBodyValid;
    }

    public HttpHeartbeat responseBodyValid(Boolean responseBodyValid) {
        this.setResponseBodyValid(responseBodyValid);
        return this;
    }

    public void setResponseBodyValid(Boolean responseBodyValid) {
        this.responseBodyValid = responseBodyValid;
    }

    public Integer getResponseBodyUncompressedBytes() {
        return this.responseBodyUncompressedBytes;
    }

    public HttpHeartbeat responseBodyUncompressedBytes(Integer responseBodyUncompressedBytes) {
        this.setResponseBodyUncompressedBytes(responseBodyUncompressedBytes);
        return this;
    }

    public void setResponseBodyUncompressedBytes(Integer responseBodyUncompressedBytes) {
        this.responseBodyUncompressedBytes = responseBodyUncompressedBytes;
    }

    public JsonNode getRedirectDetails() {
        return this.redirectDetails;
    }

    public HttpHeartbeat redirectDetails(JsonNode redirectDetails) {
        this.setRedirectDetails(redirectDetails);
        return this;
    }

    public void setRedirectDetails(JsonNode redirectDetails) {
        this.redirectDetails = redirectDetails;
    }

    public String getCacheControl() {
        return this.cacheControl;
    }

    public HttpHeartbeat cacheControl(String cacheControl) {
        this.setCacheControl(cacheControl);
        return this;
    }

    public void setCacheControl(String cacheControl) {
        this.cacheControl = cacheControl;
    }

    public String getEtag() {
        return this.etag;
    }

    public HttpHeartbeat etag(String etag) {
        this.setEtag(etag);
        return this;
    }

    public void setEtag(String etag) {
        this.etag = etag;
    }

    public Integer getCacheAge() {
        return this.cacheAge;
    }

    public HttpHeartbeat cacheAge(Integer cacheAge) {
        this.setCacheAge(cacheAge);
        return this;
    }

    public void setCacheAge(Integer cacheAge) {
        this.cacheAge = cacheAge;
    }

    public String getCdnProvider() {
        return this.cdnProvider;
    }

    public HttpHeartbeat cdnProvider(String cdnProvider) {
        this.setCdnProvider(cdnProvider);
        return this;
    }

    public void setCdnProvider(String cdnProvider) {
        this.cdnProvider = cdnProvider;
    }

    public String getCdnPop() {
        return this.cdnPop;
    }

    public HttpHeartbeat cdnPop(String cdnPop) {
        this.setCdnPop(cdnPop);
        return this;
    }

    public void setCdnPop(String cdnPop) {
        this.cdnPop = cdnPop;
    }

    public JsonNode getRateLimitDetails() {
        return this.rateLimitDetails;
    }

    public HttpHeartbeat rateLimitDetails(JsonNode rateLimitDetails) {
        this.setRateLimitDetails(rateLimitDetails);
        return this;
    }

    public void setRateLimitDetails(JsonNode rateLimitDetails) {
        this.rateLimitDetails = rateLimitDetails;
    }

    public JsonNode getNetworkPath() {
        return this.networkPath;
    }

    public HttpHeartbeat networkPath(JsonNode networkPath) {
        this.setNetworkPath(networkPath);
        return this;
    }

    public void setNetworkPath(JsonNode networkPath) {
        this.networkPath = networkPath;
    }

    public JsonNode getAgentMetrics() {
        return this.agentMetrics;
    }

    public HttpHeartbeat agentMetrics(JsonNode agentMetrics) {
        this.setAgentMetrics(agentMetrics);
        return this;
    }

    public void setAgentMetrics(JsonNode agentMetrics) {
        this.agentMetrics = agentMetrics;
    }

    public JsonNode getPhaseLatencies() {
        return this.phaseLatencies;
    }

    public HttpHeartbeat phaseLatencies(JsonNode phaseLatencies) {
        this.setPhaseLatencies(phaseLatencies);
        return this;
    }

    public void setPhaseLatencies(JsonNode phaseLatencies) {
        this.phaseLatencies = phaseLatencies;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof HttpHeartbeat)) {
            return false;
        }
        return getId() != null && getId().equals(((HttpHeartbeat) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "HttpHeartbeat{" +
            "id=" + getId() +
            ", executedAt='" + getExecutedAt() + "'" +
            ", success='" + getSuccess() + "'" +
            ", responseTimeMs=" + getResponseTimeMs() +
            ", responseSizeBytes=" + getResponseSizeBytes() +
            ", responseStatusCode=" + getResponseStatusCode() +
            ", responseContentType='" + getResponseContentType() + "'" +
            ", responseServer='" + getResponseServer() + "'" +
            ", responseCacheStatus='" + getResponseCacheStatus() + "'" +
            ", dnsLookupMs=" + getDnsLookupMs() +
            ", tcpConnectMs=" + getTcpConnectMs() +
            ", tlsHandshakeMs=" + getTlsHandshakeMs() +
            ", timeToFirstByteMs=" + getTimeToFirstByteMs() +
            ", warningThresholdMs=" + getWarningThresholdMs() +
            ", criticalThresholdMs=" + getCriticalThresholdMs() +
            ", errorType='" + getErrorType() + "'" +
            ", errorMessage='" + getErrorMessage() + "'" +
            ", rawRequestHeaders='" + getRawRequestHeaders() + "'" +
            ", rawResponseHeaders='" + getRawResponseHeaders() + "'" +
            ", rawResponseBody='" + getRawResponseBody() + "'" +
            "}";
    }
}
