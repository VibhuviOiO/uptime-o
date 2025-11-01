package uptime.observability.service.dto;

import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * Datacenter status DTO - aggregated metrics per datacenter
 */
public class DatacenterStatusDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String name;
    private String code;
    private String status;                  // HEALTHY, DEGRADED, FAILED
    private Double uptime;                  // %
    private Integer monitorCount;
    private Integer issueCount;             // warnings + failures
    private Integer degradedCount;          // warnings only
    private Integer failedCount;            // failures only
    private Integer agentOnline;
    private Integer agentOffline;
    private Instant lastCheckTime;
    private Double avgResponseTime;

    public DatacenterStatusDTO() {}

    public DatacenterStatusDTO(Long id, String name, String code, String status, Double uptime) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.status = status;
        this.uptime = uptime;
    }

    // Getters and Setters
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

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getUptime() {
        return uptime;
    }

    public void setUptime(Double uptime) {
        this.uptime = uptime;
    }

    public Integer getMonitorCount() {
        return monitorCount;
    }

    public void setMonitorCount(Integer monitorCount) {
        this.monitorCount = monitorCount;
    }

    public Integer getIssueCount() {
        return issueCount;
    }

    public void setIssueCount(Integer issueCount) {
        this.issueCount = issueCount;
    }

    public Integer getDegradedCount() {
        return degradedCount;
    }

    public void setDegradedCount(Integer degradedCount) {
        this.degradedCount = degradedCount;
    }

    public Integer getFailedCount() {
        return failedCount;
    }

    public void setFailedCount(Integer failedCount) {
        this.failedCount = failedCount;
    }

    public Integer getAgentOnline() {
        return agentOnline;
    }

    public void setAgentOnline(Integer agentOnline) {
        this.agentOnline = agentOnline;
    }

    public Integer getAgentOffline() {
        return agentOffline;
    }

    public void setAgentOffline(Integer agentOffline) {
        this.agentOffline = agentOffline;
    }

    public Instant getLastCheckTime() {
        return lastCheckTime;
    }

    public void setLastCheckTime(Instant lastCheckTime) {
        this.lastCheckTime = lastCheckTime;
    }

    public Double getAvgResponseTime() {
        return avgResponseTime;
    }

    public void setAvgResponseTime(Double avgResponseTime) {
        this.avgResponseTime = avgResponseTime;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DatacenterStatusDTO that = (DatacenterStatusDTO) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "DatacenterStatusDTO{" +
            "id=" + id +
            ", name='" + name + '\'' +
            ", status='" + status + '\'' +
            ", uptime=" + uptime +
            ", monitorCount=" + monitorCount +
            ", issueCount=" + issueCount +
            '}';
    }
}
