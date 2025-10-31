package uptime.observability.service.dto;

import java.time.Instant;

public class ApiMonitorAggregationDTO {
    private Long monitorId;
    private String monitorName;
    private String url;
    private String method;
    private String type;
    private long activeAgentsCount;
    private long inactiveAgentsCount;
    private Instant lastCheck;
    private Integer lastCheckResponseTime;

    // Getters and setters
    public Long getMonitorId() { return monitorId; }
    public void setMonitorId(Long monitorId) { this.monitorId = monitorId; }

    public String getMonitorName() { return monitorName; }
    public void setMonitorName(String monitorName) { this.monitorName = monitorName; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public long getActiveAgentsCount() { return activeAgentsCount; }
    public void setActiveAgentsCount(long activeAgentsCount) { this.activeAgentsCount = activeAgentsCount; }

    public long getInactiveAgentsCount() { return inactiveAgentsCount; }
    public void setInactiveAgentsCount(long inactiveAgentsCount) { this.inactiveAgentsCount = inactiveAgentsCount; }

    public Instant getLastCheck() { return lastCheck; }
    public void setLastCheck(Instant lastCheck) { this.lastCheck = lastCheck; }

    public Integer getLastCheckResponseTime() { return lastCheckResponseTime; }
    public void setLastCheckResponseTime(Integer lastCheckResponseTime) { this.lastCheckResponseTime = lastCheckResponseTime; }
}