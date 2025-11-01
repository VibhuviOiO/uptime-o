package uptime.observability.service.dto;

import java.io.Serializable;
import java.util.Objects;

/**
 * Monitor status DTO - current status and metrics for a monitor
 */
public class MonitorStatusDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String name;
    private String url;
    private String status;                  // HEALTHY, DEGRADED, FAILED
    private Double successRate;             // %
    private Integer averageResponseTime;    // ms
    private Integer deployedDatacenters;
    private Long lastCheckTime;             // timestamp millis
    private Integer failureCount;
    private Double slaCompliance;           // %
    private String trend;                   // UP, DOWN, STABLE

    public MonitorStatusDTO() {}

    public MonitorStatusDTO(Long id, String name, String url, String status, Double successRate) {
        this.id = id;
        this.name = name;
        this.url = url;
        this.status = status;
        this.successRate = successRate;
    }

    // Getters and Setters
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

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getSuccessRate() {
        return successRate;
    }

    public void setSuccessRate(Double successRate) {
        this.successRate = successRate;
    }

    public Integer getAverageResponseTime() {
        return averageResponseTime;
    }

    public void setAverageResponseTime(Integer averageResponseTime) {
        this.averageResponseTime = averageResponseTime;
    }

    public Integer getDeployedDatacenters() {
        return deployedDatacenters;
    }

    public void setDeployedDatacenters(Integer deployedDatacenters) {
        this.deployedDatacenters = deployedDatacenters;
    }

    public Long getLastCheckTime() {
        return lastCheckTime;
    }

    public void setLastCheckTime(Long lastCheckTime) {
        this.lastCheckTime = lastCheckTime;
    }

    public Integer getFailureCount() {
        return failureCount;
    }

    public void setFailureCount(Integer failureCount) {
        this.failureCount = failureCount;
    }

    public Double getSlaCompliance() {
        return slaCompliance;
    }

    public void setSlaCompliance(Double slaCompliance) {
        this.slaCompliance = slaCompliance;
    }

    public String getTrend() {
        return trend;
    }

    public void setTrend(String trend) {
        this.trend = trend;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MonitorStatusDTO that = (MonitorStatusDTO) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "MonitorStatusDTO{" +
            "id=" + id +
            ", name='" + name + '\'' +
            ", status='" + status + '\'' +
            ", successRate=" + successRate +
            ", averageResponseTime=" + averageResponseTime +
            '}';
    }
}
