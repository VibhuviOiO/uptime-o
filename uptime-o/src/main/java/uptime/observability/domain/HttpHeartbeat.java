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
@Table(name = "api_heartbeats")
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

    @Column(name = "tcp_connect_ms")
    private Integer tcpConnectMs;

    @Column(name = "tls_handshake_ms")
    private Integer tlsHandshakeMs;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "apiHeartbeats", "datacenterMonitors", "schedule" }, allowSetters = true)
    private HttpMonitor monitor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "apiHeartbeats", "datacenter" }, allowSetters = true)
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
