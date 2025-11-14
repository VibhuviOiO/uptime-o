package uptime.observability.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.hibernate.annotations.Type;

@Entity
@Table(name = "instance")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Instance implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @NotNull
    @Column(name = "hostname", nullable = false)
    private String hostname;

    @Column(name = "description")
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "instance_type", nullable = false)
    private InstanceType instanceType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "monitoring_type", nullable = false)
    private MonitoringType monitoringType;

    @Column(name = "agent_id")
    private Long agentId;

    @Column(name = "operating_system")
    private String operatingSystem;

    @Column(name = "platform")
    private String platform;

    @Column(name = "private_ip_address")
    private String privateIpAddress;

    @Column(name = "public_ip_address")
    private String publicIpAddress;

    @Column(name = "tags", columnDefinition = "jsonb")
    @Type(JsonNodeType.class)
    private JsonNode tags;

    @Column(name = "ping_enabled")
    private Boolean pingEnabled = true;

    @Column(name = "ping_interval")
    private Integer pingInterval = 30;

    @Column(name = "ping_timeout_ms")
    private Integer pingTimeoutMs = 3000;

    @Column(name = "ping_retry_count")
    private Integer pingRetryCount = 2;

    @Column(name = "hardware_monitoring_enabled")
    private Boolean hardwareMonitoringEnabled = false;

    @Column(name = "hardware_monitoring_interval")
    private Integer hardwareMonitoringInterval = 300;

    @Column(name = "cpu_warning_threshold")
    private Integer cpuWarningThreshold = 70;

    @Column(name = "cpu_danger_threshold")
    private Integer cpuDangerThreshold = 90;

    @Column(name = "memory_warning_threshold")
    private Integer memoryWarningThreshold = 75;

    @Column(name = "memory_danger_threshold")
    private Integer memoryDangerThreshold = 90;

    @Column(name = "disk_warning_threshold")
    private Integer diskWarningThreshold = 80;

    @Column(name = "disk_danger_threshold")
    private Integer diskDangerThreshold = 95;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "last_ping_at")
    private Instant lastPingAt;

    @Column(name = "last_hardware_check_at")
    private Instant lastHardwareCheckAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "region" }, allowSetters = true)
    private Datacenter datacenter;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instance id(Long id) {
        this.setId(id);
        return this;
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

    public Datacenter getDatacenter() {
        return datacenter;
    }

    public void setDatacenter(Datacenter datacenter) {
        this.datacenter = datacenter;
    }
}
