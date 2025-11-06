package uptime.observability.service.dto;

import java.io.Serializable;
import java.time.Instant;

/**
 * DTO for aggregated HTTP Monitor Metrics
 */
public class HttpMetricsDTO implements Serializable {
    private Long monitorId;
    private String monitorName;
    private Boolean lastSuccess;
    private Integer agentCount;
    private String regionName;
    private String datacenterName;
    private String agentName;
    private Instant lastCheckedTime;
    private Integer lastLatencyMs;

    public HttpMetricsDTO() {}

    public HttpMetricsDTO(
        Long monitorId,
        String monitorName,
        Boolean lastSuccess,
        Integer agentCount,
        String regionName,
        String datacenterName,
        String agentName,
        Instant lastCheckedTime,
        Integer lastLatencyMs
    ) {
        this.monitorId = monitorId;
        this.monitorName = monitorName;
        this.lastSuccess = lastSuccess;
        this.agentCount = agentCount;
        this.regionName = regionName;
        this.datacenterName = datacenterName;
        this.agentName = agentName;
        this.lastCheckedTime = lastCheckedTime;
        this.lastLatencyMs = lastLatencyMs;
    }

    // Getters and Setters
    public Long getMonitorId() {
        return monitorId;
    }

    public void setMonitorId(Long monitorId) {
        this.monitorId = monitorId;
    }

    public String getMonitorName() {
        return monitorName;
    }

    public void setMonitorName(String monitorName) {
        this.monitorName = monitorName;
    }

    public Boolean getLastSuccess() {
        return lastSuccess;
    }

    public void setLastSuccess(Boolean lastSuccess) {
        this.lastSuccess = lastSuccess;
    }

    public Integer getAgentCount() {
        return agentCount;
    }

    public void setAgentCount(Integer agentCount) {
        this.agentCount = agentCount;
    }

    public String getRegionName() {
        return regionName;
    }

    public void setRegionName(String regionName) {
        this.regionName = regionName;
    }

    public String getDatacenterName() {
        return datacenterName;
    }

    public void setDatacenterName(String datacenterName) {
        this.datacenterName = datacenterName;
    }

    public Instant getLastCheckedTime() {
        return lastCheckedTime;
    }

    public void setLastCheckedTime(Instant lastCheckedTime) {
        this.lastCheckedTime = lastCheckedTime;
    }

    public Integer getLastLatencyMs() {
        return lastLatencyMs;
    }

    public void setLastLatencyMs(Integer lastLatencyMs) {
        this.lastLatencyMs = lastLatencyMs;
    }

    public String getAgentName() {
        return agentName;
    }

    public void setAgentName(String agentName) {
        this.agentName = agentName;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        HttpMetricsDTO that = (HttpMetricsDTO) o;
        return monitorId != null ? monitorId.equals(that.monitorId) : that.monitorId == null;
    }

    @Override
    public int hashCode() {
        return monitorId != null ? monitorId.hashCode() : 0;
    }

    @Override
    public String toString() {
        return "HttpMetricsDTO{" +
            "monitorId=" + monitorId +
            ", monitorName='" + monitorName + '\'' +
            ", lastSuccess=" + lastSuccess +
            ", agentCount=" + agentCount +
            ", regionName='" + regionName + '\'' +
            ", datacenterName='" + datacenterName + '\'' +
            ", agentName='" + agentName + '\'' +
            ", lastCheckedTime=" + lastCheckedTime +
            ", lastLatencyMs=" + lastLatencyMs +
            '}';
    }
}
