package uptime.observability.service.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Map;
import java.util.Objects;

/**
 * A DTO for the {@link uptime.observability.domain.HttpMonitor} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class HttpMonitorDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(min = 1, max = 100)
    private String name;

    @NotNull
    @Size(min = 1, max = 10)
    private String method;

    @NotNull
    @Size(min = 1, max = 10)
    private String type;

    @Lob
    private String url;

    private Long parentId;

    private JsonNode headers;

    private JsonNode body;

    @NotNull
    private Integer intervalSeconds;

    @NotNull
    private Integer timeoutSeconds;

    @NotNull
    private Integer retryCount;

    @NotNull
    private Integer retryDelaySeconds;

    private Integer responseTimeWarningMs;

    private Integer responseTimeCriticalMs;

    private Float uptimeWarningPercent;

    private Float uptimeCriticalPercent;

    private Boolean includeResponseBody;

    private Integer resendNotificationCount;

    private Integer certificateExpiryDays;

    private Boolean ignoreTlsError;

    private Boolean checkSslCertificate;

    private Boolean checkDnsResolution;

    private Boolean upsideDownMode;

    private Integer maxRedirects;

    @Lob
    private String description;

    private String tags;

    private String monitoringVisibility;

    private Boolean enabled;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public JsonNode getHeaders() {
        return headers;
    }

    public void setHeaders(JsonNode headers) {
        this.headers = headers;
    }

    public JsonNode getBody() {
        return body;
    }

    public void setBody(JsonNode body) {
        this.body = body;
    }

    public Integer getIntervalSeconds() {
        return intervalSeconds;
    }

    public void setIntervalSeconds(Integer intervalSeconds) {
        this.intervalSeconds = intervalSeconds;
    }

    public Integer getTimeoutSeconds() {
        return timeoutSeconds;
    }

    public void setTimeoutSeconds(Integer timeoutSeconds) {
        this.timeoutSeconds = timeoutSeconds;
    }

    public Integer getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(Integer retryCount) {
        this.retryCount = retryCount;
    }

    public Integer getRetryDelaySeconds() {
        return retryDelaySeconds;
    }

    public void setRetryDelaySeconds(Integer retryDelaySeconds) {
        this.retryDelaySeconds = retryDelaySeconds;
    }

    public Integer getResponseTimeWarningMs() {
        return responseTimeWarningMs;
    }

    public void setResponseTimeWarningMs(Integer responseTimeWarningMs) {
        this.responseTimeWarningMs = responseTimeWarningMs;
    }

    public Integer getResponseTimeCriticalMs() {
        return responseTimeCriticalMs;
    }

    public void setResponseTimeCriticalMs(Integer responseTimeCriticalMs) {
        this.responseTimeCriticalMs = responseTimeCriticalMs;
    }

    public Float getUptimeWarningPercent() {
        return uptimeWarningPercent;
    }

    public void setUptimeWarningPercent(Float uptimeWarningPercent) {
        this.uptimeWarningPercent = uptimeWarningPercent;
    }

    public Float getUptimeCriticalPercent() {
        return uptimeCriticalPercent;
    }

    public void setUptimeCriticalPercent(Float uptimeCriticalPercent) {
        this.uptimeCriticalPercent = uptimeCriticalPercent;
    }

    public Boolean getIncludeResponseBody() {
        return includeResponseBody;
    }

    public void setIncludeResponseBody(Boolean includeResponseBody) {
        this.includeResponseBody = includeResponseBody;
    }

    public Integer getResendNotificationCount() {
        return resendNotificationCount;
    }

    public void setResendNotificationCount(Integer resendNotificationCount) {
        this.resendNotificationCount = resendNotificationCount;
    }

    public Integer getCertificateExpiryDays() {
        return certificateExpiryDays;
    }

    public void setCertificateExpiryDays(Integer certificateExpiryDays) {
        this.certificateExpiryDays = certificateExpiryDays;
    }

    public Boolean getIgnoreTlsError() {
        return ignoreTlsError;
    }

    public void setIgnoreTlsError(Boolean ignoreTlsError) {
        this.ignoreTlsError = ignoreTlsError;
    }

    public Boolean getCheckSslCertificate() {
        return checkSslCertificate;
    }

    public void setCheckSslCertificate(Boolean checkSslCertificate) {
        this.checkSslCertificate = checkSslCertificate;
    }

    public Boolean getCheckDnsResolution() {
        return checkDnsResolution;
    }

    public void setCheckDnsResolution(Boolean checkDnsResolution) {
        this.checkDnsResolution = checkDnsResolution;
    }

    public Boolean getUpsideDownMode() {
        return upsideDownMode;
    }

    public void setUpsideDownMode(Boolean upsideDownMode) {
        this.upsideDownMode = upsideDownMode;
    }

    public Integer getMaxRedirects() {
        return maxRedirects;
    }

    public void setMaxRedirects(Integer maxRedirects) {
        this.maxRedirects = maxRedirects;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public String getMonitoringVisibility() {
        return monitoringVisibility;
    }

    public void setMonitoringVisibility(String monitoringVisibility) {
        this.monitoringVisibility = monitoringVisibility;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof HttpMonitorDTO)) {
            return false;
        }

        HttpMonitorDTO apiMonitorDTO = (HttpMonitorDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, apiMonitorDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "HttpMonitorDTO{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", method='" + getMethod() + "'" +
            ", type='" + getType() + "'" +
            ", url='" + getUrl() + "'" +
            ", headers='" + getHeaders() + "'" +
            ", body='" + getBody() + "'" +
            ", intervalSeconds=" + getIntervalSeconds() +
            ", timeoutSeconds=" + getTimeoutSeconds() +
            ", retryCount=" + getRetryCount() +
            ", retryDelaySeconds=" + getRetryDelaySeconds() +
            "}";
    }
}
