package uptime.observability.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;

public class ServiceInstanceDTO implements Serializable {

    private Long id;

    @NotNull
    private Long serviceId;

    @NotNull
    private Long instanceId;

    private String instanceName;

    private String instanceHostname;

    private Long datacenterId;

    private String datacenterName;

    @NotNull
    private Integer port;

    private Boolean isActive;

    private Instant createdAt;

    private Instant updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public Long getInstanceId() {
        return instanceId;
    }

    public void setInstanceId(Long instanceId) {
        this.instanceId = instanceId;
    }

    public String getInstanceName() {
        return instanceName;
    }

    public void setInstanceName(String instanceName) {
        this.instanceName = instanceName;
    }

    public String getInstanceHostname() {
        return instanceHostname;
    }

    public void setInstanceHostname(String instanceHostname) {
        this.instanceHostname = instanceHostname;
    }

    public Integer getPort() {
        return port;
    }

    public void setPort(Integer port) {
        this.port = port;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ServiceInstanceDTO)) return false;
        return id != null && id.equals(((ServiceInstanceDTO) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "ServiceInstanceDTO{" +
            "id=" + getId() +
            ", serviceId=" + getServiceId() +
            ", instanceId=" + getInstanceId() +
            ", port=" + getPort() +
            "}";
    }
}
