package uptime.observability.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Type;
import uptime.observability.domain.enumeration.ServiceStatus;
import uptime.observability.domain.JsonNodeType;

@Entity
@Table(name = "service_heartbeats")
public class ServiceHeartbeat implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "executed_at", nullable = false)
    private Instant executedAt;

    @NotNull
    @Column(name = "success", nullable = false)
    private Boolean success;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ServiceStatus status;

    @Column(name = "response_time_ms")
    private Integer responseTimeMs;

    @Column(name = "error_message", columnDefinition = "text")
    private String errorMessage;

    @Column(name = "metadata", columnDefinition = "jsonb")
    @Type(JsonNodeType.class)
    private JsonNode metadata;

    @Column(name = "agent_id")
    private Long agentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    @JsonIgnoreProperties(value = { "serviceInstances" }, allowSetters = true)
    private Service service;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_instance_id")
    @JsonIgnoreProperties(value = { "service", "instance" }, allowSetters = true)
    private ServiceInstance serviceInstance;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ServiceHeartbeat id(Long id) {
        this.setId(id);
        return this;
    }

    public Instant getExecutedAt() {
        return executedAt;
    }

    public void setExecutedAt(Instant executedAt) {
        this.executedAt = executedAt;
    }

    public ServiceHeartbeat executedAt(Instant executedAt) {
        this.setExecutedAt(executedAt);
        return this;
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public ServiceHeartbeat success(Boolean success) {
        this.setSuccess(success);
        return this;
    }

    public ServiceStatus getStatus() {
        return status;
    }

    public void setStatus(ServiceStatus status) {
        this.status = status;
    }

    public ServiceHeartbeat status(ServiceStatus status) {
        this.setStatus(status);
        return this;
    }

    public Integer getResponseTimeMs() {
        return responseTimeMs;
    }

    public void setResponseTimeMs(Integer responseTimeMs) {
        this.responseTimeMs = responseTimeMs;
    }

    public ServiceHeartbeat responseTimeMs(Integer responseTimeMs) {
        this.setResponseTimeMs(responseTimeMs);
        return this;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public ServiceHeartbeat errorMessage(String errorMessage) {
        this.setErrorMessage(errorMessage);
        return this;
    }

    public JsonNode getMetadata() {
        return metadata;
    }

    public void setMetadata(JsonNode metadata) {
        this.metadata = metadata;
    }

    public ServiceHeartbeat metadata(JsonNode metadata) {
        this.setMetadata(metadata);
        return this;
    }

    public Long getAgentId() {
        return agentId;
    }

    public void setAgentId(Long agentId) {
        this.agentId = agentId;
    }

    public ServiceHeartbeat agentId(Long agentId) {
        this.setAgentId(agentId);
        return this;
    }

    public Service getService() {
        return service;
    }

    public void setService(Service service) {
        this.service = service;
    }

    public ServiceHeartbeat service(Service service) {
        this.setService(service);
        return this;
    }

    public ServiceInstance getServiceInstance() {
        return serviceInstance;
    }

    public void setServiceInstance(ServiceInstance serviceInstance) {
        this.serviceInstance = serviceInstance;
    }

    public ServiceHeartbeat serviceInstance(ServiceInstance serviceInstance) {
        this.setServiceInstance(serviceInstance);
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ServiceHeartbeat)) return false;
        return id != null && id.equals(((ServiceHeartbeat) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "ServiceHeartbeat{" +
            "id=" + getId() +
            ", executedAt='" + getExecutedAt() + "'" +
            ", status='" + getStatus() + "'" +
            "}";
    }
}
