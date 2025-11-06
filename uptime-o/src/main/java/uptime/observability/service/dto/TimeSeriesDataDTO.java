package uptime.observability.service.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.io.Serializable;
import java.time.Instant;

/**
 * DTO for time-series data points
 */
public class TimeSeriesDataDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Instant timestamp;
    private String agentName;
    private String agentRegion;
    private Boolean success;
    private Integer responseTimeMs;
    private Integer responseStatusCode;
    private String errorType;
    private String errorMessage;
    
    // Additional fields for detailed monitoring
    private Integer responseSizeBytes;
    private String responseServer;
    private String responseCacheStatus;
    private Integer dnsLookupMs;
    private Integer tcpConnectMs;
    private Integer tlsHandshakeMs;
    private Integer timeToFirstByteMs;
    private JsonNode rawResponseHeaders;
    private JsonNode rawResponseBody;

    public TimeSeriesDataDTO() {}

    public TimeSeriesDataDTO(
        Instant timestamp, String agentName, String agentRegion,
        Boolean success, Integer responseTimeMs, Integer responseStatusCode,
        String errorType, String errorMessage
    ) {
        this.timestamp = timestamp;
        this.agentName = agentName;
        this.agentRegion = agentRegion;
        this.success = success;
        this.responseTimeMs = responseTimeMs;
        this.responseStatusCode = responseStatusCode;
        this.errorType = errorType;
        this.errorMessage = errorMessage;
    }

    // Full constructor with all fields
    public TimeSeriesDataDTO(
        Instant timestamp, String agentName, String agentRegion,
        Boolean success, Integer responseTimeMs, Integer responseStatusCode,
        String errorType, String errorMessage,
        Integer responseSizeBytes, String responseServer, String responseCacheStatus,
        Integer dnsLookupMs, Integer tcpConnectMs, Integer tlsHandshakeMs,
        Integer timeToFirstByteMs, JsonNode rawResponseHeaders, JsonNode rawResponseBody
    ) {
        this(timestamp, agentName, agentRegion, success, responseTimeMs, 
             responseStatusCode, errorType, errorMessage);
        this.responseSizeBytes = responseSizeBytes;
        this.responseServer = responseServer;
        this.responseCacheStatus = responseCacheStatus;
        this.dnsLookupMs = dnsLookupMs;
        this.tcpConnectMs = tcpConnectMs;
        this.tlsHandshakeMs = tlsHandshakeMs;
        this.timeToFirstByteMs = timeToFirstByteMs;
        this.rawResponseHeaders = rawResponseHeaders;
        this.rawResponseBody = rawResponseBody;
    }

    // Getters and Setters
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }

    public String getAgentRegion() { return agentRegion; }
    public void setAgentRegion(String agentRegion) { this.agentRegion = agentRegion; }

    public Boolean getSuccess() { return success; }
    public void setSuccess(Boolean success) { this.success = success; }

    public Integer getResponseTimeMs() { return responseTimeMs; }
    public void setResponseTimeMs(Integer responseTimeMs) { this.responseTimeMs = responseTimeMs; }

    public Integer getResponseStatusCode() { return responseStatusCode; }
    public void setResponseStatusCode(Integer responseStatusCode) { this.responseStatusCode = responseStatusCode; }

    public String getErrorType() { return errorType; }
    public void setErrorType(String errorType) { this.errorType = errorType; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    // Additional field getters and setters
    public Integer getResponseSizeBytes() { return responseSizeBytes; }
    public void setResponseSizeBytes(Integer responseSizeBytes) { this.responseSizeBytes = responseSizeBytes; }

    public String getResponseServer() { return responseServer; }
    public void setResponseServer(String responseServer) { this.responseServer = responseServer; }

    public String getResponseCacheStatus() { return responseCacheStatus; }
    public void setResponseCacheStatus(String responseCacheStatus) { this.responseCacheStatus = responseCacheStatus; }

    public Integer getDnsLookupMs() { return dnsLookupMs; }
    public void setDnsLookupMs(Integer dnsLookupMs) { this.dnsLookupMs = dnsLookupMs; }

    public Integer getTcpConnectMs() { return tcpConnectMs; }
    public void setTcpConnectMs(Integer tcpConnectMs) { this.tcpConnectMs = tcpConnectMs; }

    public Integer getTlsHandshakeMs() { return tlsHandshakeMs; }
    public void setTlsHandshakeMs(Integer tlsHandshakeMs) { this.tlsHandshakeMs = tlsHandshakeMs; }

    public Integer getTimeToFirstByteMs() { return timeToFirstByteMs; }
    public void setTimeToFirstByteMs(Integer timeToFirstByteMs) { this.timeToFirstByteMs = timeToFirstByteMs; }

    public JsonNode getRawResponseHeaders() { return rawResponseHeaders; }
    public void setRawResponseHeaders(JsonNode rawResponseHeaders) { this.rawResponseHeaders = rawResponseHeaders; }

    public JsonNode getRawResponseBody() { return rawResponseBody; }
    public void setRawResponseBody(JsonNode rawResponseBody) { this.rawResponseBody = rawResponseBody; }

    @Override
    public String toString() {
        return "TimeSeriesDataDTO{" +
            "timestamp=" + timestamp +
            ", agentRegion='" + agentRegion + '\'' +
            ", success=" + success +
            ", responseTimeMs=" + responseTimeMs +
            '}';
    }
}
