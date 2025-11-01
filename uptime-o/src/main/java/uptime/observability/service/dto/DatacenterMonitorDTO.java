package uptime.observability.service.dto;

import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link uptime.observability.domain.DatacenterMonitor} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class DatacenterMonitorDTO implements Serializable {

    private Long id;

    private DatacenterDTO datacenter;

    private HttpMonitorDTO monitor;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DatacenterDTO getDatacenter() {
        return datacenter;
    }

    public void setDatacenter(DatacenterDTO datacenter) {
        this.datacenter = datacenter;
    }

    public HttpMonitorDTO getMonitor() {
        return monitor;
    }

    public void setMonitor(HttpMonitorDTO monitor) {
        this.monitor = monitor;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof DatacenterMonitorDTO)) {
            return false;
        }

        DatacenterMonitorDTO datacenterMonitorDTO = (DatacenterMonitorDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, datacenterMonitorDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "DatacenterMonitorDTO{" +
            "id=" + getId() +
            ", datacenter=" + getDatacenter() +
            ", monitor=" + getMonitor() +
            "}";
    }
}
