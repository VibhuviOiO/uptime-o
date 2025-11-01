package uptime.observability.service.dto;

import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * Dashboard metrics DTO - aggregated statistics
 */
public class DashboardMetricsDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Double overallUptime;           // % in period
    private Integer averageResponseTime;    // milliseconds
    private Long successfulChecks;
    private Long failedChecks;
    private Integer totalMonitors;
    private Integer activeMonitors;
    private Integer degradedCount;          // Warning status
    private Integer failedCount;            // Critical failures
    private Instant lastUpdated;

    public DashboardMetricsDTO() {}

    public DashboardMetricsDTO(
        Double overallUptime,
        Integer averageResponseTime,
        Long successfulChecks,
        Long failedChecks,
        Integer totalMonitors,
        Integer activeMonitors,
        Integer degradedCount,
        Integer failedCount
    ) {
        this.overallUptime = overallUptime;
        this.averageResponseTime = averageResponseTime;
        this.successfulChecks = successfulChecks;
        this.failedChecks = failedChecks;
        this.totalMonitors = totalMonitors;
        this.activeMonitors = activeMonitors;
        this.degradedCount = degradedCount;
        this.failedCount = failedCount;
        this.lastUpdated = Instant.now();
    }

    // Getters and Setters
    public Double getOverallUptime() {
        return overallUptime;
    }

    public void setOverallUptime(Double overallUptime) {
        this.overallUptime = overallUptime;
    }

    public Integer getAverageResponseTime() {
        return averageResponseTime;
    }

    public void setAverageResponseTime(Integer averageResponseTime) {
        this.averageResponseTime = averageResponseTime;
    }

    public Long getSuccessfulChecks() {
        return successfulChecks;
    }

    public void setSuccessfulChecks(Long successfulChecks) {
        this.successfulChecks = successfulChecks;
    }

    public Long getFailedChecks() {
        return failedChecks;
    }

    public void setFailedChecks(Long failedChecks) {
        this.failedChecks = failedChecks;
    }

    public Integer getTotalMonitors() {
        return totalMonitors;
    }

    public void setTotalMonitors(Integer totalMonitors) {
        this.totalMonitors = totalMonitors;
    }

    public Integer getActiveMonitors() {
        return activeMonitors;
    }

    public void setActiveMonitors(Integer activeMonitors) {
        this.activeMonitors = activeMonitors;
    }

    public Integer getDegradedCount() {
        return degradedCount;
    }

    public void setDegradedCount(Integer degradedCount) {
        this.degradedCount = degradedCount;
    }

    public Integer getFailedCount() {
        return failedCount;
    }

    public void setFailedCount(Integer failedCount) {
        this.failedCount = failedCount;
    }

    public Instant getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Instant lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DashboardMetricsDTO that = (DashboardMetricsDTO) o;
        return Objects.equals(overallUptime, that.overallUptime) &&
            Objects.equals(averageResponseTime, that.averageResponseTime) &&
            Objects.equals(successfulChecks, that.successfulChecks) &&
            Objects.equals(failedChecks, that.failedChecks) &&
            Objects.equals(totalMonitors, that.totalMonitors);
    }

    @Override
    public int hashCode() {
        return Objects.hash(overallUptime, averageResponseTime, successfulChecks, failedChecks, totalMonitors);
    }

    @Override
    public String toString() {
        return "DashboardMetricsDTO{" +
            "overallUptime=" + overallUptime +
            ", averageResponseTime=" + averageResponseTime +
            ", successfulChecks=" + successfulChecks +
            ", failedChecks=" + failedChecks +
            ", totalMonitors=" + totalMonitors +
            ", degradedCount=" + degradedCount +
            ", failedCount=" + failedCount +
            '}';
    }
}
