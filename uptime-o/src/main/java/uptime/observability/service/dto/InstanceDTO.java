package uptime.observability.service.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import uptime.observability.domain.InstanceType;
import uptime.observability.domain.MonitoringType;

public class InstanceDTO implements Serializable {

    private Long id;

    @NotNull
    private String name;

    @NotNull
    private String hostname;

    private String description;

    @NotNull
    private InstanceType instanceType;

    @NotNull
    private MonitoringType monitoringType;

    private Long agentId;
    private String operatingSystem;
    private String platform;
    private String privateIpAddress;
    private String publicIpAddress;
    private JsonNode tags;
    private Boolean pingEnabled;
    private Integer pingInterval;
    private Integer pingTimeoutMs;
    private Integer pingRetryCount;
    private Boolean hardwareMonitoringEnabled;
    private Integer hardwareMonitoringInterval;
    private Integer cpuWarningThreshold;
    private Integer cpuDangerThreshold;
    private Integer memoryWarningThreshold;
    private Integer memoryDangerThreshold;
    private Integer diskWarningThreshold;
    private Integer diskDangerThreshold;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant lastPingAt;
    private Instant lastHardwareCheckAt;
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

    public String getHostname() {
        return hostname;
    }

    public void setHostname(String hostname) {
        this.hostname = hostname;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public InstanceType getInstanceType() {
        return instanceType;
    }

    public void setInstanceType(InstanceType instanceType) {
        this.instanceType = instanceType;
    }

    public MonitoringType getMonitoringType() {
        return monitoringType;
    }

    public void setMonitoringType(MonitoringType monitoringType) {
        this.monitoringType = monitoringType;
    }

    public Long getAgentId() {
        return agentId;
    }

    public void setAgentId(Long agentId) {
        this.agentId = agentId;
    }

    public String getOperatingSystem() {
        return operatingSystem;
    }

    public void setOperatingSystem(String operatingSystem) {
        this.operatingSystem = operatingSystem;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getPrivateIpAddress() {
        return privateIpAddress;
    }

    public void setPrivateIpAddress(String privateIpAddress) {
        this.privateIpAddress = privateIpAddress;
    }

    public String getPublicIpAddress() {
        return publicIpAddress;
    }

    public void setPublicIpAddress(String publicIpAddress) {
        this.publicIpAddress = publicIpAddress;
    }

    public JsonNode getTags() {
        return tags;
    }

    public void setTags(JsonNode tags) {
        this.tags = tags;
    }

    public Boolean getPingEnabled() {
        return pingEnabled;
    }

    public void setPingEnabled(Boolean pingEnabled) {
        this.pingEnabled = pingEnabled;
    }

    public Integer getPingInterval() {
        return pingInterval;
    }

    public void setPingInterval(Integer pingInterval) {
        this.pingInterval = pingInterval;
    }

    public Integer getPingTimeoutMs() {
        return pingTimeoutMs;
    }

    public void setPingTimeoutMs(Integer pingTimeoutMs) {
        this.pingTimeoutMs = pingTimeoutMs;
    }

    public Integer getPingRetryCount() {
        return pingRetryCount;
    }

    public void setPingRetryCount(Integer pingRetryCount) {
        this.pingRetryCount = pingRetryCount;
    }

    public Boolean getHardwareMonitoringEnabled() {
        return hardwareMonitoringEnabled;
    }

    public void setHardwareMonitoringEnabled(Boolean hardwareMonitoringEnabled) {
        this.hardwareMonitoringEnabled = hardwareMonitoringEnabled;
    }

    public Integer getHardwareMonitoringInterval() {
        return hardwareMonitoringInterval;
    }

    public void setHardwareMonitoringInterval(Integer hardwareMonitoringInterval) {
        this.hardwareMonitoringInterval = hardwareMonitoringInterval;
    }

    public Integer getCpuWarningThreshold() {
        return cpuWarningThreshold;
    }

    public void setCpuWarningThreshold(Integer cpuWarningThreshold) {
        this.cpuWarningThreshold = cpuWarningThreshold;
    }

    public Integer getCpuDangerThreshold() {
        return cpuDangerThreshold;
    }

    public void setCpuDangerThreshold(Integer cpuDangerThreshold) {
        this.cpuDangerThreshold = cpuDangerThreshold;
    }

    public Integer getMemoryWarningThreshold() {
        return memoryWarningThreshold;
    }

    public void setMemoryWarningThreshold(Integer memoryWarningThreshold) {
        this.memoryWarningThreshold = memoryWarningThreshold;
    }

    public Integer getMemoryDangerThreshold() {
        return memoryDangerThreshold;
    }

    public void setMemoryDangerThreshold(Integer memoryDangerThreshold) {
        this.memoryDangerThreshold = memoryDangerThreshold;
    }

    public Integer getDiskWarningThreshold() {
        return diskWarningThreshold;
    }

    public void setDiskWarningThreshold(Integer diskWarningThreshold) {
        this.diskWarningThreshold = diskWarningThreshold;
    }

    public Integer getDiskDangerThreshold() {
        return diskDangerThreshold;
    }

    public void setDiskDangerThreshold(Integer diskDangerThreshold) {
        this.diskDangerThreshold = diskDangerThreshold;
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

    public Instant getLastPingAt() {
        return lastPingAt;
    }

    public void setLastPingAt(Instant lastPingAt) {
        this.lastPingAt = lastPingAt;
    }

    public Instant getLastHardwareCheckAt() {
        return lastHardwareCheckAt;
    }

    public void setLastHardwareCheckAt(Instant lastHardwareCheckAt) {
        this.lastHardwareCheckAt = lastHardwareCheckAt;
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
}
