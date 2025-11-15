package uptime.observability.service.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import uptime.observability.domain.enumeration.Environment;
import uptime.observability.domain.enumeration.ServiceType;

public class ServiceDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(max = 200)
    private String name;

    @Size(max = 500)
    private String description;

    @NotNull
    private ServiceType serviceType;

    @NotNull
    private Environment environment;

    private Boolean monitoringEnabled;

    @NotNull
    private Integer intervalSeconds;

    @NotNull
    private Integer timeoutMs;

    @NotNull
    private Integer retryCount;

    private Integer latencyWarningMs;

    private Integer latencyCriticalMs;

    private JsonNode advancedConfig;

    private Boolean isActive;

    private Instant createdAt;

    private Instant updatedAt;

    private Long datacenterId;

    private String datacenterName;

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ServiceType getServiceType() {
        return serviceType;
    }

    public void setServiceType(ServiceType serviceType) {
        this.serviceType = serviceType;
    }

    public Environment getEnvironment() {
        return environment;
    }

    public void setEnvironment(Environment environment) {
        this.environment = environment;
    }

    public Boolean getMonitoringEnabled() {
        return monitoringEnabled;
    }

    public void setMonitoringEnabled(Boolean monitoringEnabled) {
        this.monitoringEnabled = monitoringEnabled;
    }

    public Integer getIntervalSeconds() {
        return intervalSeconds;
    }

    public void setIntervalSeconds(Integer intervalSeconds) {
        this.intervalSeconds = intervalSeconds;
    }

    public Integer getTimeoutMs() {
        return timeoutMs;
    }

    public void setTimeoutMs(Integer timeoutMs) {
        this.timeoutMs = timeoutMs;
    }

    public Integer getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(Integer retryCount) {
        this.retryCount = retryCount;
    }

    public Integer getLatencyWarningMs() {
        return latencyWarningMs;
    }

    public void setLatencyWarningMs(Integer latencyWarningMs) {
        this.latencyWarningMs = latencyWarningMs;
    }

    public Integer getLatencyCriticalMs() {
        return latencyCriticalMs;
    }

    public void setLatencyCriticalMs(Integer latencyCriticalMs) {
        this.latencyCriticalMs = latencyCriticalMs;
    }

    public JsonNode getAdvancedConfig() {
        return advancedConfig;
    }

    public void setAdvancedConfig(JsonNode advancedConfig) {
        this.advancedConfig = advancedConfig;
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

    public Long getDatacenterId() {
        return datacenterId;
    }

    public void setDatacenterId(Long datacenterId) {
        this.datacenterId = datacenterId;
    }

    public String getDatacenterName() {
        return datacenterName;
    }

    public void setDatacenterName(String datacenterName) {
        this.datacenterName = datacenterName;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ServiceDTO)) return false;
        return id != null && id.equals(((ServiceDTO) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "ServiceDTO{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", serviceType='" + getServiceType() + "'" +
            ", environment='" + getEnvironment() + "'" +
            "}";
    }
}
