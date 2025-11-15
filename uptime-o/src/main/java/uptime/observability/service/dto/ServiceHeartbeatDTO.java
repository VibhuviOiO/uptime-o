package uptime.observability.service.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import uptime.observability.domain.enumeration.ServiceStatus;

public class ServiceHeartbeatDTO implements Serializable {

    private Long id;

    @NotNull
    private Long serviceId;

    private Long serviceInstanceId;

    @NotNull
    private Instant executedAt;

    @NotNull
    private Boolean success;

    @NotNull
    private ServiceStatus status;

    private Integer responseTimeMs;

    private String errorMessage;

    private JsonNode metadata;

    private Long agentId;

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

    public Long getServiceInstanceId() {
        return serviceInstanceId;
    }

    public void setServiceInstanceId(Long serviceInstanceId) {
        this.serviceInstanceId = serviceInstanceId;
    }

    public Instant getExecutedAt() {
        return executedAt;
    }

    public void setExecutedAt(Instant executedAt) {
        this.executedAt = executedAt;
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public ServiceStatus getStatus() {
        return status;
    }

    public void setStatus(ServiceStatus status) {
        this.status = status;
    }

    public Integer getResponseTimeMs() {
        return responseTimeMs;
    }

    public void setResponseTimeMs(Integer responseTimeMs) {
        this.responseTimeMs = responseTimeMs;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public JsonNode getMetadata() {
        return metadata;
    }

    public void setMetadata(JsonNode metadata) {
        this.metadata = metadata;
    }

    public Long getAgentId() {
        return agentId;
    }

    public void setAgentId(Long agentId) {
        this.agentId = agentId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ServiceHeartbeatDTO)) return false;
        return id != null && id.equals(((ServiceHeartbeatDTO) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "ServiceHeartbeatDTO{" +
            "id=" + getId() +
            ", serviceId=" + getServiceId() +
            ", executedAt='" + getExecutedAt() + "'" +
            ", status='" + getStatus() + "'" +
            "}";
    }
}
