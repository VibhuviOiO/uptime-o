package uptime.observability.service.dto;

import java.io.Serializable;
import java.time.Instant;

/**
 * DTO for Agent-wise metrics breakdown
 */
public class AgentMetricsDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String agentName;
    private String agentRegion;
    private String datacenter;
    private Long totalChecks;
    private Long successfulChecks;
    private Long failedChecks;
    private Long warningChecks;
    private Long criticalChecks;
    private Double averageResponseTime;
    private Double uptimePercentage;
    private Integer p95ResponseTime;
    private Integer p99ResponseTime;
    private Instant lastCheckedAt;
    private Boolean lastSuccess;
    private Integer lastResponseTime;

    public AgentMetricsDTO() {}

    public AgentMetricsDTO(
        String agentName, String agentRegion, String datacenter,
        Long totalChecks, Long successfulChecks, Long failedChecks,
        Long warningChecks, Long criticalChecks,
        Double averageResponseTime, Double uptimePercentage,
        Integer p95ResponseTime, Integer p99ResponseTime,
        Instant lastCheckedAt, Boolean lastSuccess, Integer lastResponseTime
    ) {
        this.agentName = agentName;
        this.agentRegion = agentRegion;
        this.datacenter = datacenter;
        this.totalChecks = totalChecks;
        this.successfulChecks = successfulChecks;
        this.failedChecks = failedChecks;
        this.warningChecks = warningChecks;
        this.criticalChecks = criticalChecks;
        this.averageResponseTime = averageResponseTime;
        this.uptimePercentage = uptimePercentage;
        this.p95ResponseTime = p95ResponseTime;
        this.p99ResponseTime = p99ResponseTime;
        this.lastCheckedAt = lastCheckedAt;
        this.lastSuccess = lastSuccess;
        this.lastResponseTime = lastResponseTime;
    }

    // Getters and Setters
    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }

    public String getAgentRegion() { return agentRegion; }
    public void setAgentRegion(String agentRegion) { this.agentRegion = agentRegion; }

    public String getDatacenter() { return datacenter; }
    public void setDatacenter(String datacenter) { this.datacenter = datacenter; }

    public Long getTotalChecks() { return totalChecks; }
    public void setTotalChecks(Long totalChecks) { this.totalChecks = totalChecks; }

    public Long getSuccessfulChecks() { return successfulChecks; }
    public void setSuccessfulChecks(Long successfulChecks) { this.successfulChecks = successfulChecks; }

    public Long getFailedChecks() { return failedChecks; }
    public void setFailedChecks(Long failedChecks) { this.failedChecks = failedChecks; }

    public Long getWarningChecks() { return warningChecks; }
    public void setWarningChecks(Long warningChecks) { this.warningChecks = warningChecks; }

    public Long getCriticalChecks() { return criticalChecks; }
    public void setCriticalChecks(Long criticalChecks) { this.criticalChecks = criticalChecks; }

    public Double getAverageResponseTime() { return averageResponseTime; }
    public void setAverageResponseTime(Double averageResponseTime) { this.averageResponseTime = averageResponseTime; }

    public Double getUptimePercentage() { return uptimePercentage; }
    public void setUptimePercentage(Double uptimePercentage) { this.uptimePercentage = uptimePercentage; }

    public Integer getP95ResponseTime() { return p95ResponseTime; }
    public void setP95ResponseTime(Integer p95ResponseTime) { this.p95ResponseTime = p95ResponseTime; }

    public Integer getP99ResponseTime() { return p99ResponseTime; }
    public void setP99ResponseTime(Integer p99ResponseTime) { this.p99ResponseTime = p99ResponseTime; }

    public Instant getLastCheckedAt() { return lastCheckedAt; }
    public void setLastCheckedAt(Instant lastCheckedAt) { this.lastCheckedAt = lastCheckedAt; }

    public Boolean getLastSuccess() { return lastSuccess; }
    public void setLastSuccess(Boolean lastSuccess) { this.lastSuccess = lastSuccess; }

    public Integer getLastResponseTime() { return lastResponseTime; }
    public void setLastResponseTime(Integer lastResponseTime) { this.lastResponseTime = lastResponseTime; }

    @Override
    public String toString() {
        return "AgentMetricsDTO{" +
            "agentName='" + agentName + '\'' +
            ", agentRegion='" + agentRegion + '\'' +
            ", uptimePercentage=" + uptimePercentage +
            '}';
    }
}
