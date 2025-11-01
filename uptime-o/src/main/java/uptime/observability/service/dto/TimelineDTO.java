package uptime.observability.service.dto;

import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * Timeline DTO - collection of timeline points
 */
public class TimelineDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private java.util.List<TimelinePointDTO> intervals;
    private Instant startTime;
    private Instant endTime;
    private String period;

    public TimelineDTO() {}

    public TimelineDTO(java.util.List<TimelinePointDTO> intervals, Instant startTime, Instant endTime, String period) {
        this.intervals = intervals;
        this.startTime = startTime;
        this.endTime = endTime;
        this.period = period;
    }

    public java.util.List<TimelinePointDTO> getIntervals() {
        return intervals;
    }

    public void setIntervals(java.util.List<TimelinePointDTO> intervals) {
        this.intervals = intervals;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }

    public String getPeriod() {
        return period;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TimelineDTO that = (TimelineDTO) o;
        return Objects.equals(period, that.period);
    }

    @Override
    public int hashCode() {
        return Objects.hash(period);
    }

    @Override
    public String toString() {
        return "TimelineDTO{" +
            "intervals=" + (intervals != null ? intervals.size() : 0) +
            ", startTime=" + startTime +
            ", endTime=" + endTime +
            ", period='" + period + '\'' +
            '}';
    }
}
