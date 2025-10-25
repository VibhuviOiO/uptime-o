package uptime.observability.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

/**
 * A Schedule.
 */
@Entity
@Table(name = "schedules")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Schedule implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(min = 1, max = 50)
    @Column(name = "name", length = 50, nullable = false)
    private String name;

    @NotNull
    @Min(value = 1)
    @Column(name = "interval", nullable = false)
    private Integer interval;

    @Column(name = "include_response_body")
    private Boolean includeResponseBody;

    @Column(name = "thresholds_warning")
    private Integer thresholdsWarning;

    @Column(name = "thresholds_critical")
    private Integer thresholdsCritical;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "schedule")
    @JsonIgnoreProperties(value = { "apiHeartbeats", "datacenterMonitors", "schedule" }, allowSetters = true)
    private Set<ApiMonitor> apiMonitors = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Schedule id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public Schedule name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getInterval() {
        return this.interval;
    }

    public Schedule interval(Integer interval) {
        this.setInterval(interval);
        return this;
    }

    public void setInterval(Integer interval) {
        this.interval = interval;
    }

    public Boolean getIncludeResponseBody() {
        return this.includeResponseBody;
    }

    public Schedule includeResponseBody(Boolean includeResponseBody) {
        this.setIncludeResponseBody(includeResponseBody);
        return this;
    }

    public void setIncludeResponseBody(Boolean includeResponseBody) {
        this.includeResponseBody = includeResponseBody;
    }

    public Integer getThresholdsWarning() {
        return this.thresholdsWarning;
    }

    public Schedule thresholdsWarning(Integer thresholdsWarning) {
        this.setThresholdsWarning(thresholdsWarning);
        return this;
    }

    public void setThresholdsWarning(Integer thresholdsWarning) {
        this.thresholdsWarning = thresholdsWarning;
    }

    public Integer getThresholdsCritical() {
        return this.thresholdsCritical;
    }

    public Schedule thresholdsCritical(Integer thresholdsCritical) {
        this.setThresholdsCritical(thresholdsCritical);
        return this;
    }

    public void setThresholdsCritical(Integer thresholdsCritical) {
        this.thresholdsCritical = thresholdsCritical;
    }

    public Set<ApiMonitor> getApiMonitors() {
        return this.apiMonitors;
    }

    public void setApiMonitors(Set<ApiMonitor> apiMonitors) {
        if (this.apiMonitors != null) {
            this.apiMonitors.forEach(i -> i.setSchedule(null));
        }
        if (apiMonitors != null) {
            apiMonitors.forEach(i -> i.setSchedule(this));
        }
        this.apiMonitors = apiMonitors;
    }

    public Schedule apiMonitors(Set<ApiMonitor> apiMonitors) {
        this.setApiMonitors(apiMonitors);
        return this;
    }

    public Schedule addApiMonitor(ApiMonitor apiMonitor) {
        this.apiMonitors.add(apiMonitor);
        apiMonitor.setSchedule(this);
        return this;
    }

    public Schedule removeApiMonitor(ApiMonitor apiMonitor) {
        this.apiMonitors.remove(apiMonitor);
        apiMonitor.setSchedule(null);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Schedule)) {
            return false;
        }
        return getId() != null && getId().equals(((Schedule) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Schedule{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", interval=" + getInterval() +
            ", includeResponseBody='" + getIncludeResponseBody() + "'" +
            ", thresholdsWarning=" + getThresholdsWarning() +
            ", thresholdsCritical=" + getThresholdsCritical() +
            "}";
    }
}
