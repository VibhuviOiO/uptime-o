package uptime.observability.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import org.hibernate.annotations.Type;

/**
 * A HttpMonitor.
 */
@Entity
@Table(name = "api_monitors")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class HttpMonitor implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(min = 1, max = 100)
    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @NotNull
    @Size(min = 1, max = 10)
    @Column(name = "method", length = 10, nullable = false)
    private String method;

    @NotNull
    @Size(min = 1, max = 10)
    @Column(name = "type", length = 10, nullable = false)
    private String type;

    @Column(name = "url", nullable = false, columnDefinition = "text")
    private String url;

    @Column(name = "additional_urls", columnDefinition = "jsonb")
    @Type(JsonNodeType.class)
    private JsonNode additionalUrls;

    @Column(name = "headers", columnDefinition = "jsonb")
    @Type(JsonNodeType.class)
    private JsonNode headers;

    @Column(name = "body", columnDefinition = "jsonb")
    @Type(JsonNodeType.class)
    private JsonNode body;

    @Column(name = "calls_per_interval")
    private Integer callsPerInterval;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "monitor")
    @JsonIgnoreProperties(value = { "monitor", "agent" }, allowSetters = true)
    private Set<HttpHeartbeat> apiHeartbeats = new HashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "monitor")
    @JsonIgnoreProperties(value = { "agent", "monitor" }, allowSetters = true)
    private Set<AgentMonitor> agentMonitors = new HashSet<>();

    @ManyToOne(fetch = FetchType.EAGER)
    @JsonIgnoreProperties(value = { "apiMonitors" }, allowSetters = true)
    private Schedule schedule;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public HttpMonitor id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public HttpMonitor name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMethod() {
        return this.method;
    }

    public HttpMonitor method(String method) {
        this.setMethod(method);
        return this;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getType() {
        return this.type;
    }

    public HttpMonitor type(String type) {
        this.setType(type);
        return this;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getUrl() {
        return this.url;
    }

    public HttpMonitor url(String url) {
        this.setUrl(url);
        return this;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public JsonNode getAdditionalUrls() {
        return this.additionalUrls;
    }

    public HttpMonitor additionalUrls(JsonNode additionalUrls) {
        this.setAdditionalUrls(additionalUrls);
        return this;
    }

    public void setAdditionalUrls(JsonNode additionalUrls) {
        this.additionalUrls = additionalUrls;
    }

    public JsonNode getHeaders() {
        return this.headers;
    }

    public HttpMonitor headers(JsonNode headers) {
        this.setHeaders(headers);
        return this;
    }

    public void setHeaders(JsonNode headers) {
        this.headers = headers;
    }

    public JsonNode getBody() {
        return this.body;
    }

    public HttpMonitor body(JsonNode body) {
        this.setBody(body);
        return this;
    }

    public void setBody(JsonNode body) {
        this.body = body;
    }

    public Integer getCallsPerInterval() {
        return this.callsPerInterval;
    }

    public HttpMonitor callsPerInterval(Integer callsPerInterval) {
        this.setCallsPerInterval(callsPerInterval);
        return this;
    }

    public void setCallsPerInterval(Integer callsPerInterval) {
        this.callsPerInterval = callsPerInterval;
    }

    public Set<HttpHeartbeat> getHttpHeartbeats() {
        return this.apiHeartbeats;
    }

    public void setHttpHeartbeats(Set<HttpHeartbeat> apiHeartbeats) {
        if (this.apiHeartbeats != null) {
            this.apiHeartbeats.forEach(i -> i.setMonitor(null));
        }
        if (apiHeartbeats != null) {
            apiHeartbeats.forEach(i -> i.setMonitor(this));
        }
        this.apiHeartbeats = apiHeartbeats;
    }

    public HttpMonitor apiHeartbeats(Set<HttpHeartbeat> apiHeartbeats) {
        this.setHttpHeartbeats(apiHeartbeats);
        return this;
    }

    public HttpMonitor addHttpHeartbeat(HttpHeartbeat apiHeartbeat) {
        this.apiHeartbeats.add(apiHeartbeat);
        apiHeartbeat.setMonitor(this);
        return this;
    }

    public HttpMonitor removeHttpHeartbeat(HttpHeartbeat apiHeartbeat) {
        this.apiHeartbeats.remove(apiHeartbeat);
        apiHeartbeat.setMonitor(null);
        return this;
    }

    public Set<AgentMonitor> getAgentMonitors() {
        return this.agentMonitors;
    }

    public void setAgentMonitors(Set<AgentMonitor> agentMonitors) {
        if (this.agentMonitors != null) {
            this.agentMonitors.forEach(i -> i.setMonitor(null));
        }
        if (agentMonitors != null) {
            agentMonitors.forEach(i -> i.setMonitor(this));
        }
        this.agentMonitors = agentMonitors;
    }

    public HttpMonitor agentMonitors(Set<AgentMonitor> agentMonitors) {
        this.setAgentMonitors(agentMonitors);
        return this;
    }

    public HttpMonitor addAgentMonitor(AgentMonitor agentMonitor) {
        this.agentMonitors.add(agentMonitor);
        agentMonitor.setMonitor(this);
        return this;
    }

    public HttpMonitor removeAgentMonitor(AgentMonitor agentMonitor) {
        this.agentMonitors.remove(agentMonitor);
        agentMonitor.setMonitor(null);
        return this;
    }

    public Schedule getSchedule() {
        return this.schedule;
    }

    public void setSchedule(Schedule schedule) {
        this.schedule = schedule;
    }

    public HttpMonitor schedule(Schedule schedule) {
        this.setSchedule(schedule);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof HttpMonitor)) {
            return false;
        }
        return getId() != null && getId().equals(((HttpMonitor) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "HttpMonitor{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", method='" + getMethod() + "'" +
            ", type='" + getType() + "'" +
            ", url='" + getUrl() + "'" +
            ", additionalUrls='" + getAdditionalUrls() + "'" +
            ", headers='" + getHeaders() + "'" +
            ", body='" + getBody() + "'" +
            "}";
    }
}
