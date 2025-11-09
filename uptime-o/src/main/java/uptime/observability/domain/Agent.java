package uptime.observability.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

/**
 * A Agent.
 */
@Entity
@Table(name = "agents")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Agent implements Serializable {

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

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "agent")
    @JsonIgnoreProperties(value = { "monitor", "agent" }, allowSetters = true)
    private Set<HttpHeartbeat> apiHeartbeats = new HashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "agent")
    @JsonIgnoreProperties(value = { "agent", "monitor" }, allowSetters = true)
    private Set<AgentMonitor> agentMonitors = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "agents", "region" }, allowSetters = true)
    private Datacenter datacenter;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Agent id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public Agent name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<HttpHeartbeat> getHttpHeartbeats() {
        return this.apiHeartbeats;
    }

    public void setHttpHeartbeats(Set<HttpHeartbeat> apiHeartbeats) {
        if (this.apiHeartbeats != null) {
            this.apiHeartbeats.forEach(i -> i.setAgent(null));
        }
        if (apiHeartbeats != null) {
            apiHeartbeats.forEach(i -> i.setAgent(this));
        }
        this.apiHeartbeats = apiHeartbeats;
    }

    public Agent apiHeartbeats(Set<HttpHeartbeat> apiHeartbeats) {
        this.setHttpHeartbeats(apiHeartbeats);
        return this;
    }

    public Agent addHttpHeartbeat(HttpHeartbeat apiHeartbeat) {
        this.apiHeartbeats.add(apiHeartbeat);
        apiHeartbeat.setAgent(this);
        return this;
    }

    public Agent removeHttpHeartbeat(HttpHeartbeat apiHeartbeat) {
        this.apiHeartbeats.remove(apiHeartbeat);
        apiHeartbeat.setAgent(null);
        return this;
    }

    public Datacenter getDatacenter() {
        return this.datacenter;
    }

    public void setDatacenter(Datacenter datacenter) {
        this.datacenter = datacenter;
    }

    public Agent datacenter(Datacenter datacenter) {
        this.setDatacenter(datacenter);
        return this;
    }

    public Set<AgentMonitor> getAgentMonitors() {
        return this.agentMonitors;
    }

    public void setAgentMonitors(Set<AgentMonitor> agentMonitors) {
        if (this.agentMonitors != null) {
            this.agentMonitors.forEach(i -> i.setAgent(null));
        }
        if (agentMonitors != null) {
            agentMonitors.forEach(i -> i.setAgent(this));
        }
        this.agentMonitors = agentMonitors;
    }

    public Agent agentMonitors(Set<AgentMonitor> agentMonitors) {
        this.setAgentMonitors(agentMonitors);
        return this;
    }

    public Agent addAgentMonitor(AgentMonitor agentMonitor) {
        this.agentMonitors.add(agentMonitor);
        agentMonitor.setAgent(this);
        return this;
    }

    public Agent removeAgentMonitor(AgentMonitor agentMonitor) {
        this.agentMonitors.remove(agentMonitor);
        agentMonitor.setAgent(null);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Agent)) {
            return false;
        }
        return getId() != null && getId().equals(((Agent) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Agent{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            "}";
    }
}
