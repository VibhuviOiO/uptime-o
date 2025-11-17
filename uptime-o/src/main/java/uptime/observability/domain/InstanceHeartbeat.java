package uptime.observability.domain;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.hibernate.annotations.Type;

@Entity
@Table(name = "instance_heartbeat")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class InstanceHeartbeat implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "instance_id", nullable = false)
    private Long instanceId;

    @NotNull
    @Column(name = "executed_at", nullable = false)
    private Instant executedAt;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "heartbeat_type", nullable = false)
    private HeartbeatType heartbeatType;

    @NotNull
    @Column(name = "success", nullable = false)
    private Boolean success;

    @Column(name = "response_time_ms")
    private Integer responseTimeMs;

    @Column(name = "packet_loss")
    private Float packetLoss;

    @Column(name = "jitter_ms")
    private Integer jitterMs;

    @Column(name = "cpu_usage")
    private Float cpuUsage;

    @Column(name = "memory_usage")
    private Float memoryUsage;

    @Column(name = "disk_usage")
    private Float diskUsage;

    @Column(name = "load_average")
    private Float loadAverage;

    @Column(name = "process_count")
    private Integer processCount;

    @Column(name = "network_rx_bytes")
    private Long networkRxBytes;

    @Column(name = "network_tx_bytes")
    private Long networkTxBytes;

    @Column(name = "uptime_seconds")
    private Long uptimeSeconds;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private HeartbeatStatus status;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "error_type")
    private String errorType;

    @Column(name = "agent_id")
    private Long agentId;

    @Column(name = "metadata", columnDefinition = "jsonb")
    @Type(JsonNodeType.class)
    private JsonNode metadata;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getInstanceId() {
        return instanceId;
    }

    public void setInstanceId(Long instanceId) {
        this.instanceId = instanceId;
    }

    public Instant getExecutedAt() {
        return executedAt;
    }

    public void setExecutedAt(Instant executedAt) {
        this.executedAt = executedAt;
    }

    public HeartbeatType getHeartbeatType() {
        return heartbeatType;
    }

    public void setHeartbeatType(HeartbeatType heartbeatType) {
        this.heartbeatType = heartbeatType;
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public Integer getResponseTimeMs() {
        return responseTimeMs;
    }

    public void setResponseTimeMs(Integer responseTimeMs) {
        this.responseTimeMs = responseTimeMs;
    }

    public Float getPacketLoss() {
        return packetLoss;
    }

    public void setPacketLoss(Float packetLoss) {
        this.packetLoss = packetLoss;
    }

    public Integer getJitterMs() {
        return jitterMs;
    }

    public void setJitterMs(Integer jitterMs) {
        this.jitterMs = jitterMs;
    }

    public Float getCpuUsage() {
        return cpuUsage;
    }

    public void setCpuUsage(Float cpuUsage) {
        this.cpuUsage = cpuUsage;
    }

    public Float getMemoryUsage() {
        return memoryUsage;
    }

    public void setMemoryUsage(Float memoryUsage) {
        this.memoryUsage = memoryUsage;
    }

    public Float getDiskUsage() {
        return diskUsage;
    }

    public void setDiskUsage(Float diskUsage) {
        this.diskUsage = diskUsage;
    }

    public Float getLoadAverage() {
        return loadAverage;
    }

    public void setLoadAverage(Float loadAverage) {
        this.loadAverage = loadAverage;
    }

    public Integer getProcessCount() {
        return processCount;
    }

    public void setProcessCount(Integer processCount) {
        this.processCount = processCount;
    }

    public Long getNetworkRxBytes() {
        return networkRxBytes;
    }

    public void setNetworkRxBytes(Long networkRxBytes) {
        this.networkRxBytes = networkRxBytes;
    }

    public Long getNetworkTxBytes() {
        return networkTxBytes;
    }

    public void setNetworkTxBytes(Long networkTxBytes) {
        this.networkTxBytes = networkTxBytes;
    }

    public Long getUptimeSeconds() {
        return uptimeSeconds;
    }

    public void setUptimeSeconds(Long uptimeSeconds) {
        this.uptimeSeconds = uptimeSeconds;
    }

    public HeartbeatStatus getStatus() {
        return status;
    }

    public void setStatus(HeartbeatStatus status) {
        this.status = status;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getErrorType() {
        return errorType;
    }

    public void setErrorType(String errorType) {
        this.errorType = errorType;
    }

    public Long getAgentId() {
        return agentId;
    }

    public void setAgentId(Long agentId) {
        this.agentId = agentId;
    }

    public JsonNode getMetadata() {
        return metadata;
    }

    public void setMetadata(JsonNode metadata) {
        this.metadata = metadata;
    }
}
