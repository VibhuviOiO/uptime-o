package uptime.observability.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

/**
 * A ApiMonitor.
 */
@Entity
@Table(name = "api_monitors")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ApiMonitor implements Serializable {

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

    @Column(name = "headers", columnDefinition = "jsonb")
    private String headers;

    @Column(name = "body", columnDefinition = "jsonb")
    private String body;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "monitor")
    @JsonIgnoreProperties(value = { "monitor", "agent" }, allowSetters = true)
    private Set<ApiHeartbeat> apiHeartbeats = new HashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "monitor")
    @JsonIgnoreProperties(value = { "datacenter", "monitor" }, allowSetters = true)
    private Set<DatacenterMonitor> datacenterMonitors = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "apiMonitors" }, allowSetters = true)
    private Schedule schedule;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public ApiMonitor id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public ApiMonitor name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMethod() {
        return this.method;
    }

    public ApiMonitor method(String method) {
        this.setMethod(method);
        return this;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getType() {
        return this.type;
    }

    public ApiMonitor type(String type) {
        this.setType(type);
        return this;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getUrl() {
        return this.url;
    }

    public ApiMonitor url(String url) {
        this.setUrl(url);
        return this;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getHeaders() {
        return this.headers;
    }

    public ApiMonitor headers(String headers) {
        this.setHeaders(headers);
        return this;
    }

    public void setHeaders(String headers) {
        this.headers = headers;
    }

    public String getBody() {
        return this.body;
    }

    public ApiMonitor body(String body) {
        this.setBody(body);
        return this;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public Set<ApiHeartbeat> getApiHeartbeats() {
        return this.apiHeartbeats;
    }

    public void setApiHeartbeats(Set<ApiHeartbeat> apiHeartbeats) {
        if (this.apiHeartbeats != null) {
            this.apiHeartbeats.forEach(i -> i.setMonitor(null));
        }
        if (apiHeartbeats != null) {
            apiHeartbeats.forEach(i -> i.setMonitor(this));
        }
        this.apiHeartbeats = apiHeartbeats;
    }

    public ApiMonitor apiHeartbeats(Set<ApiHeartbeat> apiHeartbeats) {
        this.setApiHeartbeats(apiHeartbeats);
        return this;
    }

    public ApiMonitor addApiHeartbeat(ApiHeartbeat apiHeartbeat) {
        this.apiHeartbeats.add(apiHeartbeat);
        apiHeartbeat.setMonitor(this);
        return this;
    }

    public ApiMonitor removeApiHeartbeat(ApiHeartbeat apiHeartbeat) {
        this.apiHeartbeats.remove(apiHeartbeat);
        apiHeartbeat.setMonitor(null);
        return this;
    }

    public Set<DatacenterMonitor> getDatacenterMonitors() {
        return this.datacenterMonitors;
    }

    public void setDatacenterMonitors(Set<DatacenterMonitor> datacenterMonitors) {
        if (this.datacenterMonitors != null) {
            this.datacenterMonitors.forEach(i -> i.setMonitor(null));
        }
        if (datacenterMonitors != null) {
            datacenterMonitors.forEach(i -> i.setMonitor(this));
        }
        this.datacenterMonitors = datacenterMonitors;
    }

    public ApiMonitor datacenterMonitors(Set<DatacenterMonitor> datacenterMonitors) {
        this.setDatacenterMonitors(datacenterMonitors);
        return this;
    }

    public ApiMonitor addDatacenterMonitor(DatacenterMonitor datacenterMonitor) {
        this.datacenterMonitors.add(datacenterMonitor);
        datacenterMonitor.setMonitor(this);
        return this;
    }

    public ApiMonitor removeDatacenterMonitor(DatacenterMonitor datacenterMonitor) {
        this.datacenterMonitors.remove(datacenterMonitor);
        datacenterMonitor.setMonitor(null);
        return this;
    }

    public Schedule getSchedule() {
        return this.schedule;
    }

    public void setSchedule(Schedule schedule) {
        this.schedule = schedule;
    }

    public ApiMonitor schedule(Schedule schedule) {
        this.setSchedule(schedule);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ApiMonitor)) {
            return false;
        }
        return getId() != null && getId().equals(((ApiMonitor) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ApiMonitor{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", method='" + getMethod() + "'" +
            ", type='" + getType() + "'" +
            ", url='" + getUrl() + "'" +
            ", headers='" + getHeaders() + "'" +
            ", body='" + getBody() + "'" +
            "}";
    }
}
