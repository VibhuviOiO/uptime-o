package uptime.observability.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

/**
 * AgentMonitor junction table.
 * Many-to-many relationship between HttpMonitor and Agent.
 * Allows multiple agents from different locations to monitor the same API.
 */
@Entity
@Table(
    name = "agent_monitors",
    uniqueConstraints = { @UniqueConstraint(columnNames = { "agent_id", "monitor_id" }) }
)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class AgentMonitor extends AbstractAuditingEntity<Long> {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @NotNull
    @JoinColumn(name = "agent_id", nullable = false)
    @JsonIgnoreProperties(value = { "apiHeartbeats", "agentMonitors", "datacenter" }, allowSetters = true)
    private Agent agent;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @NotNull
    @JoinColumn(name = "monitor_id", nullable = false)
    @JsonIgnoreProperties(
        value = { "apiHeartbeats", "agentMonitors", "httpMetrics", "httpMonitorSchedules", "schedule" },
        allowSetters = true
    )
    private HttpMonitor monitor;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public AgentMonitor id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Boolean getActive() {
        return this.active;
    }

    public AgentMonitor active(Boolean active) {
        this.setActive(active);
        return this;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Agent getAgent() {
        return this.agent;
    }

    public void setAgent(Agent agent) {
        this.agent = agent;
    }

    public AgentMonitor agent(Agent agent) {
        this.setAgent(agent);
        return this;
    }

    public HttpMonitor getMonitor() {
        return this.monitor;
    }

    public void setMonitor(HttpMonitor monitor) {
        this.monitor = monitor;
    }

    public AgentMonitor monitor(HttpMonitor monitor) {
        this.setMonitor(monitor);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof AgentMonitor)) {
            return false;
        }
        return getId() != null && getId().equals(((AgentMonitor) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "AgentMonitor{" +
            "id=" + getId() +
            ", active='" + getActive() + "'" +
            ", createdBy='" + getCreatedBy() + "'" +
            ", createdDate='" + getCreatedDate() + "'" +
            ", lastModifiedBy='" + getLastModifiedBy() + "'" +
            ", lastModifiedDate='" + getLastModifiedDate() + "'" +
            "}";
    }
}
