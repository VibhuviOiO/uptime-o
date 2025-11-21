package uptime.observability.service.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public class StatusPageDTO {

    public static class PublicStatusDTO {
        private String overallStatus;
        private List<HttpMonitorStatusDTO> httpMonitors;
        private Instant lastUpdated;

        public String getOverallStatus() { return overallStatus; }
        public void setOverallStatus(String overallStatus) { this.overallStatus = overallStatus; }
        public List<HttpMonitorStatusDTO> getHttpMonitors() { return httpMonitors; }
        public void setHttpMonitors(List<HttpMonitorStatusDTO> httpMonitors) { this.httpMonitors = httpMonitors; }
        public Instant getLastUpdated() { return lastUpdated; }
        public void setLastUpdated(Instant lastUpdated) { this.lastUpdated = lastUpdated; }
    }

    public static class PrivateStatusDTO {
        private String overallStatus;
        private List<HttpMonitorStatusDTO> httpMonitors;
        private List<InstanceStatusDTO> instances;
        private List<ServiceStatusDTO> services;
        private List<DependencyStatusDTO> dependencies;
        private Instant lastUpdated;

        public String getOverallStatus() { return overallStatus; }
        public void setOverallStatus(String overallStatus) { this.overallStatus = overallStatus; }
        public List<HttpMonitorStatusDTO> getHttpMonitors() { return httpMonitors; }
        public void setHttpMonitors(List<HttpMonitorStatusDTO> httpMonitors) { this.httpMonitors = httpMonitors; }
        public List<InstanceStatusDTO> getInstances() { return instances; }
        public void setInstances(List<InstanceStatusDTO> instances) { this.instances = instances; }
        public List<ServiceStatusDTO> getServices() { return services; }
        public void setServices(List<ServiceStatusDTO> services) { this.services = services; }
        public List<DependencyStatusDTO> getDependencies() { return dependencies; }
        public void setDependencies(List<DependencyStatusDTO> dependencies) { this.dependencies = dependencies; }
        public Instant getLastUpdated() { return lastUpdated; }
        public void setLastUpdated(Instant lastUpdated) { this.lastUpdated = lastUpdated; }
    }

    public static class HttpMonitorStatusDTO {
        private Long id;
        private String name;
        private String url;
        private String status;
        private Integer responseTimeMs;
        private Boolean success;
        private String errorMessage;
        private Instant lastChecked;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Integer getResponseTimeMs() { return responseTimeMs; }
        public void setResponseTimeMs(Integer responseTimeMs) { this.responseTimeMs = responseTimeMs; }
        public Boolean getSuccess() { return success; }
        public void setSuccess(Boolean success) { this.success = success; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
        public Instant getLastChecked() { return lastChecked; }
        public void setLastChecked(Instant lastChecked) { this.lastChecked = lastChecked; }
    }

    public static class InstanceStatusDTO {
        private Long id;
        private String name;
        private String hostname;
        private String status;
        private Integer responseTimeMs;
        private Float cpuUsage;
        private Float memoryUsage;
        private Float diskUsage;
        private Boolean success;
        private String errorMessage;
        private Instant lastChecked;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getHostname() { return hostname; }
        public void setHostname(String hostname) { this.hostname = hostname; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Integer getResponseTimeMs() { return responseTimeMs; }
        public void setResponseTimeMs(Integer responseTimeMs) { this.responseTimeMs = responseTimeMs; }
        public Float getCpuUsage() { return cpuUsage; }
        public void setCpuUsage(Float cpuUsage) { this.cpuUsage = cpuUsage; }
        public Float getMemoryUsage() { return memoryUsage; }
        public void setMemoryUsage(Float memoryUsage) { this.memoryUsage = memoryUsage; }
        public Float getDiskUsage() { return diskUsage; }
        public void setDiskUsage(Float diskUsage) { this.diskUsage = diskUsage; }
        public Boolean getSuccess() { return success; }
        public void setSuccess(Boolean success) { this.success = success; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
        public Instant getLastChecked() { return lastChecked; }
        public void setLastChecked(Instant lastChecked) { this.lastChecked = lastChecked; }
    }

    public static class ServiceStatusDTO {
        private Long id;
        private String name;
        private String serviceType;
        private String environment;
        private String status;
        private Integer responseTimeMs;
        private Integer healthyInstances;
        private Integer totalInstances;
        private Boolean success;
        private String errorMessage;
        private Map<String, Object> metadata;
        private Instant lastChecked;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getServiceType() { return serviceType; }
        public void setServiceType(String serviceType) { this.serviceType = serviceType; }
        public String getEnvironment() { return environment; }
        public void setEnvironment(String environment) { this.environment = environment; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Integer getResponseTimeMs() { return responseTimeMs; }
        public void setResponseTimeMs(Integer responseTimeMs) { this.responseTimeMs = responseTimeMs; }
        public Integer getHealthyInstances() { return healthyInstances; }
        public void setHealthyInstances(Integer healthyInstances) { this.healthyInstances = healthyInstances; }
        public Integer getTotalInstances() { return totalInstances; }
        public void setTotalInstances(Integer totalInstances) { this.totalInstances = totalInstances; }
        public Boolean getSuccess() { return success; }
        public void setSuccess(Boolean success) { this.success = success; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
        public Map<String, Object> getMetadata() { return metadata; }
        public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
        public Instant getLastChecked() { return lastChecked; }
        public void setLastChecked(Instant lastChecked) { this.lastChecked = lastChecked; }
    }

    public static class DependencyStatusDTO {
        private String parentType;
        private Long parentId;
        private String parentName;
        private String childType;
        private Long childId;
        private String childName;
        private String parentStatus;
        private String childStatus;
        private Boolean isHealthy;

        public String getParentType() { return parentType; }
        public void setParentType(String parentType) { this.parentType = parentType; }
        public Long getParentId() { return parentId; }
        public void setParentId(Long parentId) { this.parentId = parentId; }
        public String getParentName() { return parentName; }
        public void setParentName(String parentName) { this.parentName = parentName; }
        public String getChildType() { return childType; }
        public void setChildType(String childType) { this.childType = childType; }
        public Long getChildId() { return childId; }
        public void setChildId(Long childId) { this.childId = childId; }
        public String getChildName() { return childName; }
        public void setChildName(String childName) { this.childName = childName; }
        public String getParentStatus() { return parentStatus; }
        public void setParentStatus(String parentStatus) { this.parentStatus = parentStatus; }
        public String getChildStatus() { return childStatus; }
        public void setChildStatus(String childStatus) { this.childStatus = childStatus; }
        public Boolean getIsHealthy() { return isHealthy; }
        public void setIsHealthy(Boolean isHealthy) { this.isHealthy = isHealthy; }
    }
}