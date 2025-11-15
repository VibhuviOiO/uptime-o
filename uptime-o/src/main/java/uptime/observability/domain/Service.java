package uptime.observability.domain;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Type;
import uptime.observability.domain.enumeration.Environment;
import uptime.observability.domain.enumeration.ServiceType;
import uptime.observability.domain.JsonNodeType;

@Entity
@Table(name = "services")
public class Service implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 200)
    @Column(name = "name", length = 200, nullable = false)
    private String name;

    @Size(max = 500)
    @Column(name = "description", length = 500)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", nullable = false)
    private ServiceType serviceType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "environment", nullable = false)
    private Environment environment;

    @Column(name = "monitoring_enabled")
    private Boolean monitoringEnabled;

    @NotNull
    @Column(name = "interval_seconds", nullable = false)
    private Integer intervalSeconds;

    @NotNull
    @Column(name = "timeout_ms", nullable = false)
    private Integer timeoutMs;

    @NotNull
    @Column(name = "retry_count", nullable = false)
    private Integer retryCount;

    @Column(name = "latency_warning_ms")
    private Integer latencyWarningMs;

    @Column(name = "latency_critical_ms")
    private Integer latencyCriticalMs;

    @Column(name = "advanced_config", columnDefinition = "jsonb")
    @Type(JsonNodeType.class)
    private JsonNode advancedConfig;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "datacenter_id")
    private Datacenter datacenter;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Service id(Long id) {
        this.setId(id);
        return this;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Service name(String name) {
        this.setName(name);
        return this;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Service description(String description) {
        this.setDescription(description);
        return this;
    }

    public ServiceType getServiceType() {
        return serviceType;
    }

    public void setServiceType(ServiceType serviceType) {
        this.serviceType = serviceType;
    }

    public Service serviceType(ServiceType serviceType) {
        this.setServiceType(serviceType);
        return this;
    }

    public Environment getEnvironment() {
        return environment;
    }

    public void setEnvironment(Environment environment) {
        this.environment = environment;
    }

    public Service environment(Environment environment) {
        this.setEnvironment(environment);
        return this;
    }

    public Boolean getMonitoringEnabled() {
        return monitoringEnabled;
    }

    public void setMonitoringEnabled(Boolean monitoringEnabled) {
        this.monitoringEnabled = monitoringEnabled;
    }

    public Service monitoringEnabled(Boolean monitoringEnabled) {
        this.setMonitoringEnabled(monitoringEnabled);
        return this;
    }

    public Integer getIntervalSeconds() {
        return intervalSeconds;
    }

    public void setIntervalSeconds(Integer intervalSeconds) {
        this.intervalSeconds = intervalSeconds;
    }

    public Service intervalSeconds(Integer intervalSeconds) {
        this.setIntervalSeconds(intervalSeconds);
        return this;
    }

    public Integer getTimeoutMs() {
        return timeoutMs;
    }

    public void setTimeoutMs(Integer timeoutMs) {
        this.timeoutMs = timeoutMs;
    }

    public Service timeoutMs(Integer timeoutMs) {
        this.setTimeoutMs(timeoutMs);
        return this;
    }

    public Integer getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(Integer retryCount) {
        this.retryCount = retryCount;
    }

    public Service retryCount(Integer retryCount) {
        this.setRetryCount(retryCount);
        return this;
    }

    public Integer getLatencyWarningMs() {
        return latencyWarningMs;
    }

    public void setLatencyWarningMs(Integer latencyWarningMs) {
        this.latencyWarningMs = latencyWarningMs;
    }

    public Service latencyWarningMs(Integer latencyWarningMs) {
        this.setLatencyWarningMs(latencyWarningMs);
        return this;
    }

    public Integer getLatencyCriticalMs() {
        return latencyCriticalMs;
    }

    public void setLatencyCriticalMs(Integer latencyCriticalMs) {
        this.latencyCriticalMs = latencyCriticalMs;
    }

    public Service latencyCriticalMs(Integer latencyCriticalMs) {
        this.setLatencyCriticalMs(latencyCriticalMs);
        return this;
    }

    public JsonNode getAdvancedConfig() {
        return advancedConfig;
    }

    public void setAdvancedConfig(JsonNode advancedConfig) {
        this.advancedConfig = advancedConfig;
    }

    public Service advancedConfig(JsonNode advancedConfig) {
        this.setAdvancedConfig(advancedConfig);
        return this;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Service isActive(Boolean isActive) {
        this.setIsActive(isActive);
        return this;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Service createdAt(Instant createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Service updatedAt(Instant updatedAt) {
        this.setUpdatedAt(updatedAt);
        return this;
    }

    public Datacenter getDatacenter() {
        return datacenter;
    }

    public void setDatacenter(Datacenter datacenter) {
        this.datacenter = datacenter;
    }

    public Service datacenter(Datacenter datacenter) {
        this.setDatacenter(datacenter);
        return this;
    }

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        if (monitoringEnabled == null) {
            monitoringEnabled = true;
        }
        if (isActive == null) {
            isActive = true;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Service)) return false;
        return id != null && id.equals(((Service) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Service{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", serviceType='" + getServiceType() + "'" +
            ", environment='" + getEnvironment() + "'" +
            "}";
    }
}
