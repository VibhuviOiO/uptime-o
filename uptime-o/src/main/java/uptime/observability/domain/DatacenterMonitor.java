package uptime.observability.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DatacenterMonitor.
 */
@Entity
@Table(name = "datacenter_monitors")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class DatacenterMonitor implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "datacenter_id")
    @JsonIgnoreProperties(value = { "agents", "datacenterMonitors", "region" }, allowSetters = true)
    private Datacenter datacenter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "monitor_id")
    @JsonIgnoreProperties(value = { "apiHeartbeats", "datacenterMonitors", "schedule" }, allowSetters = true)
    private HttpMonitor monitor;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public DatacenterMonitor id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Datacenter getDatacenter() {
        return this.datacenter;
    }

    public void setDatacenter(Datacenter datacenter) {
        this.datacenter = datacenter;
    }

    public DatacenterMonitor datacenter(Datacenter datacenter) {
        this.setDatacenter(datacenter);
        return this;
    }

    public HttpMonitor getMonitor() {
        return this.monitor;
    }

    public void setMonitor(HttpMonitor apiMonitor) {
        this.monitor = apiMonitor;
    }

    public DatacenterMonitor monitor(HttpMonitor apiMonitor) {
        this.setMonitor(apiMonitor);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    // Update equals and hashCode to use id
    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof DatacenterMonitor)) {
            return false;
        }
        return getId() != null && getId().equals(((DatacenterMonitor) o).getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "DatacenterMonitor{" +
            "id=" + getId() +
            "}";
    }
}
