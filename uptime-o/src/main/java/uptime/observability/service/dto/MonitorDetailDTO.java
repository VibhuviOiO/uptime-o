package uptime.observability.service.dto;

import java.io.Serializable;
import java.time.Instant;
import java.util.List;

/**
 * DTO for Monitor Detail Page - contains monitor info and statistics
 */
public class MonitorDetailDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String name;
    private String url;
    private String method;
    private String protocol;
    private Integer frequency;
    private Boolean enabled;
    private Integer warningThresholdMs;
    private Integer criticalThresholdMs;
    private Instant createdAt;
    private Instant updatedAt;
    
    // Statistics
    private Long totalChecks;
    private Long successfulChecks;
    private Long failedChecks;
    private Double averageResponseTime;
    private Double uptimePercentage;
    private Instant lastCheckedAt;
    private Boolean lastSuccess;
    
    // Regions
    private List<String> regions;
    
    // Agents
    private List<String> agents;

    public MonitorDetailDTO() {}

    public MonitorDetailDTO(
        Long id, String name, String url, String method, String protocol, 
        Integer frequency, Boolean enabled, Integer warningThresholdMs, 
        Integer criticalThresholdMs, Instant createdAt, Instant updatedAt,
        Long totalChecks, Long successfulChecks, Long failedChecks,
        Double averageResponseTime, Double uptimePercentage,
        Instant lastCheckedAt, Boolean lastSuccess
    ) {
        this.id = id;
        this.name = name;
        this.url = url;
        this.method = method;
        this.protocol = protocol;
        this.frequency = frequency;
        this.enabled = enabled;
        this.warningThresholdMs = warningThresholdMs;
        this.criticalThresholdMs = criticalThresholdMs;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.totalChecks = totalChecks;
        this.successfulChecks = successfulChecks;
        this.failedChecks = failedChecks;
        this.averageResponseTime = averageResponseTime;
        this.uptimePercentage = uptimePercentage;
        this.lastCheckedAt = lastCheckedAt;
        this.lastSuccess = lastSuccess;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }

    public String getProtocol() { return protocol; }
    public void setProtocol(String protocol) { this.protocol = protocol; }

    public Integer getFrequency() { return frequency; }
    public void setFrequency(Integer frequency) { this.frequency = frequency; }

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }

    public Integer getWarningThresholdMs() { return warningThresholdMs; }
    public void setWarningThresholdMs(Integer warningThresholdMs) { this.warningThresholdMs = warningThresholdMs; }

    public Integer getCriticalThresholdMs() { return criticalThresholdMs; }
    public void setCriticalThresholdMs(Integer criticalThresholdMs) { this.criticalThresholdMs = criticalThresholdMs; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public Long getTotalChecks() { return totalChecks; }
    public void setTotalChecks(Long totalChecks) { this.totalChecks = totalChecks; }

    public Long getSuccessfulChecks() { return successfulChecks; }
    public void setSuccessfulChecks(Long successfulChecks) { this.successfulChecks = successfulChecks; }

    public Long getFailedChecks() { return failedChecks; }
    public void setFailedChecks(Long failedChecks) { this.failedChecks = failedChecks; }

    public Double getAverageResponseTime() { return averageResponseTime; }
    public void setAverageResponseTime(Double averageResponseTime) { this.averageResponseTime = averageResponseTime; }

    public Double getUptimePercentage() { return uptimePercentage; }
    public void setUptimePercentage(Double uptimePercentage) { this.uptimePercentage = uptimePercentage; }

    public Instant getLastCheckedAt() { return lastCheckedAt; }
    public void setLastCheckedAt(Instant lastCheckedAt) { this.lastCheckedAt = lastCheckedAt; }

    public Boolean getLastSuccess() { return lastSuccess; }
    public void setLastSuccess(Boolean lastSuccess) { this.lastSuccess = lastSuccess; }

    public List<String> getRegions() { return regions; }
    public void setRegions(List<String> regions) { this.regions = regions; }

    public List<String> getAgents() { return agents; }
    public void setAgents(List<String> agents) { this.agents = agents; }

    @Override
    public String toString() {
        return "MonitorDetailDTO{" +
            "id=" + id +
            ", name='" + name + '\'' +
            ", url='" + url + '\'' +
            ", uptimePercentage=" + uptimePercentage +
            '}';
    }
}
