package uptime.observability.service.dto;

import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * Timeline data point DTO for charting
 */
public class TimelinePointDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Instant timestamp;
    private Long successCount;
    private Long failureCount;
    private Integer avgResponseTime;
    private Double successRate;

    public TimelinePointDTO() {}

    public TimelinePointDTO(Instant timestamp, Long successCount, Long failureCount, Integer avgResponseTime) {
        this.timestamp = timestamp;
        this.successCount = successCount;
        this.failureCount = failureCount;
        this.avgResponseTime = avgResponseTime;
        long total = successCount + failureCount;
        this.successRate = total > 0 ? (double) (successCount * 100) / total : 100.0;
    }

    // Getters and Setters
    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public Long getSuccessCount() {
        return successCount;
    }

    public void setSuccessCount(Long successCount) {
        this.successCount = successCount;
    }

    public Long getFailureCount() {
        return failureCount;
    }

    public void setFailureCount(Long failureCount) {
        this.failureCount = failureCount;
    }

    public Integer getAvgResponseTime() {
        return avgResponseTime;
    }

    public void setAvgResponseTime(Integer avgResponseTime) {
        this.avgResponseTime = avgResponseTime;
    }

    public Double getSuccessRate() {
        return successRate;
    }

    public void setSuccessRate(Double successRate) {
        this.successRate = successRate;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TimelinePointDTO that = (TimelinePointDTO) o;
        return Objects.equals(timestamp, that.timestamp);
    }

    @Override
    public int hashCode() {
        return Objects.hash(timestamp);
    }

    @Override
    public String toString() {
        return "TimelinePointDTO{" +
            "timestamp=" + timestamp +
            ", successCount=" + successCount +
            ", failureCount=" + failureCount +
            ", avgResponseTime=" + avgResponseTime +
            ", successRate=" + successRate +
            '}';
    }
}
