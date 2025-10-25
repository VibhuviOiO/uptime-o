package uptime.observability.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link uptime.observability.domain.Schedule} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ScheduleDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(min = 1, max = 50)
    private String name;

    @NotNull
    @Min(value = 1)
    private Integer interval;

    private Boolean includeResponseBody;

    private Integer thresholdsWarning;

    private Integer thresholdsCritical;

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

    public Integer getInterval() {
        return interval;
    }

    public void setInterval(Integer interval) {
        this.interval = interval;
    }

    public Boolean getIncludeResponseBody() {
        return includeResponseBody;
    }

    public void setIncludeResponseBody(Boolean includeResponseBody) {
        this.includeResponseBody = includeResponseBody;
    }

    public Integer getThresholdsWarning() {
        return thresholdsWarning;
    }

    public void setThresholdsWarning(Integer thresholdsWarning) {
        this.thresholdsWarning = thresholdsWarning;
    }

    public Integer getThresholdsCritical() {
        return thresholdsCritical;
    }

    public void setThresholdsCritical(Integer thresholdsCritical) {
        this.thresholdsCritical = thresholdsCritical;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ScheduleDTO)) {
            return false;
        }

        ScheduleDTO scheduleDTO = (ScheduleDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, scheduleDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ScheduleDTO{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", interval=" + getInterval() +
            ", includeResponseBody='" + getIncludeResponseBody() + "'" +
            ", thresholdsWarning=" + getThresholdsWarning() +
            ", thresholdsCritical=" + getThresholdsCritical() +
            "}";
    }
}
