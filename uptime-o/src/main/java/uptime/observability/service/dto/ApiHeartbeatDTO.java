package uptime.observability.service.dto;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link uptime.observability.domain.ApiHeartbeat} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ApiHeartbeatDTO implements Serializable {

    private Long id;

    @NotNull
    private Instant executedAt;

    private Boolean success;

    private Integer responseTimeMs;

    private Integer responseSizeBytes;

    private Integer responseStatusCode;

    @Size(max = 50)
    private String responseContentType;

    @Size(max = 50)
    private String responseServer;

    @Size(max = 50)
    private String responseCacheStatus;

    private Integer dnsLookupMs;

    private Integer tcpConnectMs;

    private Integer tlsHandshakeMs;

    private Integer timeToFirstByteMs;

    private Integer warningThresholdMs;

    private Integer criticalThresholdMs;

    @Size(max = 50)
    private String errorType;

    private String errorMessage;

    private String rawRequestHeaders;

    private String rawResponseHeaders;

    private String rawResponseBody;

    private ApiMonitorDTO monitor;

    private AgentDTO agent;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getExecutedAt() {
        return executedAt;
    }

    public void setExecutedAt(Instant executedAt) {
        this.executedAt = executedAt;
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public Integer getResponseTimeMs() {
        return responseTimeMs;
    }

    public void setResponseTimeMs(Integer responseTimeMs) {
        this.responseTimeMs = responseTimeMs;
    }

    public Integer getResponseSizeBytes() {
        return responseSizeBytes;
    }

    public void setResponseSizeBytes(Integer responseSizeBytes) {
        this.responseSizeBytes = responseSizeBytes;
    }

    public Integer getResponseStatusCode() {
        return responseStatusCode;
    }

    public void setResponseStatusCode(Integer responseStatusCode) {
        this.responseStatusCode = responseStatusCode;
    }

    public String getResponseContentType() {
        return responseContentType;
    }

    public void setResponseContentType(String responseContentType) {
        this.responseContentType = responseContentType;
    }

    public String getResponseServer() {
        return responseServer;
    }

    public void setResponseServer(String responseServer) {
        this.responseServer = responseServer;
    }

    public String getResponseCacheStatus() {
        return responseCacheStatus;
    }

    public void setResponseCacheStatus(String responseCacheStatus) {
        this.responseCacheStatus = responseCacheStatus;
    }

    public Integer getDnsLookupMs() {
        return dnsLookupMs;
    }

    public void setDnsLookupMs(Integer dnsLookupMs) {
        this.dnsLookupMs = dnsLookupMs;
    }

    public Integer getTcpConnectMs() {
        return tcpConnectMs;
    }

    public void setTcpConnectMs(Integer tcpConnectMs) {
        this.tcpConnectMs = tcpConnectMs;
    }

    public Integer getTlsHandshakeMs() {
        return tlsHandshakeMs;
    }

    public void setTlsHandshakeMs(Integer tlsHandshakeMs) {
        this.tlsHandshakeMs = tlsHandshakeMs;
    }

    public Integer getTimeToFirstByteMs() {
        return timeToFirstByteMs;
    }

    public void setTimeToFirstByteMs(Integer timeToFirstByteMs) {
        this.timeToFirstByteMs = timeToFirstByteMs;
    }

    public Integer getWarningThresholdMs() {
        return warningThresholdMs;
    }

    public void setWarningThresholdMs(Integer warningThresholdMs) {
        this.warningThresholdMs = warningThresholdMs;
    }

    public Integer getCriticalThresholdMs() {
        return criticalThresholdMs;
    }

    public void setCriticalThresholdMs(Integer criticalThresholdMs) {
        this.criticalThresholdMs = criticalThresholdMs;
    }

    public String getErrorType() {
        return errorType;
    }

    public void setErrorType(String errorType) {
        this.errorType = errorType;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getRawRequestHeaders() {
        return rawRequestHeaders;
    }

    public void setRawRequestHeaders(String rawRequestHeaders) {
        this.rawRequestHeaders = rawRequestHeaders;
    }

    public String getRawResponseHeaders() {
        return rawResponseHeaders;
    }

    public void setRawResponseHeaders(String rawResponseHeaders) {
        this.rawResponseHeaders = rawResponseHeaders;
    }

    public String getRawResponseBody() {
        return rawResponseBody;
    }

    public void setRawResponseBody(String rawResponseBody) {
        this.rawResponseBody = rawResponseBody;
    }

    public ApiMonitorDTO getMonitor() {
        return monitor;
    }

    public void setMonitor(ApiMonitorDTO monitor) {
        this.monitor = monitor;
    }

    public AgentDTO getAgent() {
        return agent;
    }

    public void setAgent(AgentDTO agent) {
        this.agent = agent;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ApiHeartbeatDTO)) {
            return false;
        }

        ApiHeartbeatDTO apiHeartbeatDTO = (ApiHeartbeatDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, apiHeartbeatDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ApiHeartbeatDTO{" +
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
            ", monitor=" + getMonitor() +
            ", agent=" + getAgent() +
            "}";
    }
}
