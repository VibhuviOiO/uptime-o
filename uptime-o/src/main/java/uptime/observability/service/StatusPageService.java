package uptime.observability.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uptime.observability.domain.*;
import uptime.observability.domain.enumeration.DependencyType;
import uptime.observability.repository.*;
import uptime.observability.service.dto.StatusPageDTO.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class StatusPageService {

    private final HttpMonitorRepository httpMonitorRepository;
    private final HttpHeartbeatRepository httpHeartbeatRepository;
    private final InstanceRepository instanceRepository;
    private final InstanceHeartbeatRepository instanceHeartbeatRepository;
    private final ServiceRepository serviceRepository;
    private final ServiceHeartbeatRepository serviceHeartbeatRepository;
    private final StatusDependencyRepository statusDependencyRepository;
    private final ObjectMapper objectMapper;

    public StatusPageService(
        HttpMonitorRepository httpMonitorRepository,
        HttpHeartbeatRepository httpHeartbeatRepository,
        InstanceRepository instanceRepository,
        InstanceHeartbeatRepository instanceHeartbeatRepository,
        ServiceRepository serviceRepository,
        ServiceHeartbeatRepository serviceHeartbeatRepository,
        StatusDependencyRepository statusDependencyRepository,
        ObjectMapper objectMapper
    ) {
        this.httpMonitorRepository = httpMonitorRepository;
        this.httpHeartbeatRepository = httpHeartbeatRepository;
        this.instanceRepository = instanceRepository;
        this.instanceHeartbeatRepository = instanceHeartbeatRepository;
        this.serviceRepository = serviceRepository;
        this.serviceHeartbeatRepository = serviceHeartbeatRepository;
        this.statusDependencyRepository = statusDependencyRepository;
        this.objectMapper = objectMapper;
    }

    public PublicStatusDTO getPublicStatus() {
        PublicStatusDTO status = new PublicStatusDTO();
        
        List<HttpMonitorStatusDTO> httpStatuses = getHttpMonitorStatuses();
        status.setHttpMonitors(httpStatuses);
        status.setOverallStatus(calculateOverallStatus(httpStatuses));
        status.setLastUpdated(Instant.now());
        
        return status;
    }

    public PrivateStatusDTO getPrivateStatus() {
        PrivateStatusDTO status = new PrivateStatusDTO();
        
        List<HttpMonitorStatusDTO> httpStatuses = getHttpMonitorStatuses();
        List<InstanceStatusDTO> instanceStatuses = getInstanceStatuses();
        List<ServiceStatusDTO> serviceStatuses = getServiceStatuses();
        List<DependencyStatusDTO> dependencies = getDependencyStatuses();
        
        status.setHttpMonitors(httpStatuses);
        status.setInstances(instanceStatuses);
        status.setServices(serviceStatuses);
        status.setDependencies(dependencies);
        status.setOverallStatus(calculateOverallPrivateStatus(httpStatuses, instanceStatuses, serviceStatuses));
        status.setLastUpdated(Instant.now());
        
        return status;
    }

    private List<HttpMonitorStatusDTO> getHttpMonitorStatuses() {
        List<HttpMonitor> monitors = httpMonitorRepository.findByEnabledTrue();
        return monitors.stream().map(this::mapHttpMonitorStatus).collect(Collectors.toList());
    }

    private HttpMonitorStatusDTO mapHttpMonitorStatus(HttpMonitor monitor) {
        HttpMonitorStatusDTO dto = new HttpMonitorStatusDTO();
        dto.setId(monitor.getId());
        dto.setName(monitor.getName());
        dto.setUrl(monitor.getUrl());
        
        // Get latest heartbeat
        Optional<HttpHeartbeat> latestHeartbeat = httpHeartbeatRepository
            .findFirstByMonitorOrderByExecutedAtDesc(monitor);
            
        if (latestHeartbeat.isPresent()) {
            HttpHeartbeat heartbeat = latestHeartbeat.get();
            dto.setSuccess(heartbeat.getSuccess());
            dto.setResponseTimeMs(heartbeat.getResponseTimeMs());
            dto.setErrorMessage(heartbeat.getErrorMessage());
            dto.setLastChecked(heartbeat.getExecutedAt());
            dto.setStatus(determineHttpStatus(heartbeat));
        } else {
            dto.setStatus("UNKNOWN");
            dto.setSuccess(false);
        }
        
        return dto;
    }

    private List<InstanceStatusDTO> getInstanceStatuses() {
        List<Instance> instances = instanceRepository.findAll();
        return instances.stream().map(this::mapInstanceStatus).collect(Collectors.toList());
    }

    private InstanceStatusDTO mapInstanceStatus(Instance instance) {
        InstanceStatusDTO dto = new InstanceStatusDTO();
        dto.setId(instance.getId());
        dto.setName(instance.getName());
        dto.setHostname(instance.getHostname());
        
        // Get latest heartbeat
        Optional<InstanceHeartbeat> latestHeartbeat = instanceHeartbeatRepository
            .findFirstByInstanceIdOrderByExecutedAtDesc(instance.getId());
            
        if (latestHeartbeat.isPresent()) {
            InstanceHeartbeat heartbeat = latestHeartbeat.get();
            dto.setSuccess(heartbeat.getSuccess());
            dto.setResponseTimeMs(heartbeat.getResponseTimeMs());
            dto.setCpuUsage(heartbeat.getCpuUsage());
            dto.setMemoryUsage(heartbeat.getMemoryUsage());
            dto.setDiskUsage(heartbeat.getDiskUsage());
            dto.setErrorMessage(heartbeat.getErrorMessage());
            dto.setLastChecked(heartbeat.getExecutedAt());
            dto.setStatus(heartbeat.getStatus().name());
        } else {
            dto.setStatus("UNKNOWN");
            dto.setSuccess(false);
        }
        
        return dto;
    }

    private List<ServiceStatusDTO> getServiceStatuses() {
        List<uptime.observability.domain.Service> services = serviceRepository.findByIsActiveTrue();
        return services.stream().map(this::mapServiceStatus).collect(Collectors.toList());
    }

    private ServiceStatusDTO mapServiceStatus(uptime.observability.domain.Service service) {
        ServiceStatusDTO dto = new ServiceStatusDTO();
        dto.setId(service.getId());
        dto.setName(service.getName());
        dto.setServiceType(service.getServiceType().name());
        dto.setEnvironment(service.getEnvironment().name());
        
        // Get latest cluster heartbeat (serviceInstanceId = null)
        Optional<ServiceHeartbeat> latestHeartbeat = serviceHeartbeatRepository
            .findFirstByServiceAndServiceInstanceIsNullOrderByExecutedAtDesc(service);
            
        if (latestHeartbeat.isPresent()) {
            ServiceHeartbeat heartbeat = latestHeartbeat.get();
            dto.setSuccess(heartbeat.getSuccess());
            dto.setResponseTimeMs(heartbeat.getResponseTimeMs());
            dto.setErrorMessage(heartbeat.getErrorMessage());
            dto.setLastChecked(heartbeat.getExecutedAt());
            dto.setStatus(heartbeat.getStatus().name());
            
            // Parse metadata for additional info
            if (heartbeat.getMetadata() != null) {
                try {
                    Map<String, Object> metadata = objectMapper.convertValue(heartbeat.getMetadata(), Map.class);
                    dto.setMetadata(metadata);
                } catch (Exception e) {
                    // Ignore parsing errors
                }
            }
        } else {
            dto.setStatus("UNKNOWN");
            dto.setSuccess(false);
        }
        
        // Count healthy vs total instances
        long totalInstances = serviceHeartbeatRepository.countDistinctServiceInstancesByService(service);
        long healthyInstances = serviceHeartbeatRepository.countHealthyInstancesByService(service);
        dto.setTotalInstances((int) totalInstances);
        dto.setHealthyInstances((int) healthyInstances);
        
        return dto;
    }

    private List<DependencyStatusDTO> getDependencyStatuses() {
        List<StatusDependency> dependencies = statusDependencyRepository.findAll();
        return dependencies.stream().map(this::mapDependencyStatus).collect(Collectors.toList());
    }

    public PrivateStatusDTO getPrivateStatusByPage(Long statusPageId) {
        PrivateStatusDTO status = new PrivateStatusDTO();
        
        List<HttpMonitorStatusDTO> httpStatuses = getHttpMonitorStatuses();
        List<InstanceStatusDTO> instanceStatuses = getInstanceStatuses();
        List<ServiceStatusDTO> serviceStatuses = getServiceStatuses();
        List<DependencyStatusDTO> dependencies = getDependencyStatusesByPage(statusPageId);
        
        status.setHttpMonitors(httpStatuses);
        status.setInstances(instanceStatuses);
        status.setServices(serviceStatuses);
        status.setDependencies(dependencies);
        status.setOverallStatus(calculateOverallPrivateStatus(httpStatuses, instanceStatuses, serviceStatuses));
        status.setLastUpdated(Instant.now());
        
        return status;
    }

    private List<DependencyStatusDTO> getDependencyStatusesByPage(Long statusPageId) {
        List<StatusDependency> dependencies = statusDependencyRepository.findByStatusPageId(statusPageId);
        return dependencies.stream().map(this::mapDependencyStatus).collect(Collectors.toList());
    }

    private DependencyStatusDTO mapDependencyStatus(StatusDependency dependency) {
        DependencyStatusDTO dto = new DependencyStatusDTO();
        dto.setParentType(dependency.getParentType().name());
        dto.setParentId(dependency.getParentId());
        dto.setChildType(dependency.getChildType().name());
        dto.setChildId(dependency.getChildId());
        
        // Get entity names and statuses
        String parentName = getEntityName(dependency.getParentType(), dependency.getParentId());
        String childName = getEntityName(dependency.getChildType(), dependency.getChildId());
        String parentStatus = getEntityStatus(dependency.getParentType(), dependency.getParentId());
        String childStatus = getEntityStatus(dependency.getChildType(), dependency.getChildId());
        
        dto.setParentName(parentName);
        dto.setChildName(childName);
        dto.setParentStatus(parentStatus);
        dto.setChildStatus(childStatus);
        dto.setIsHealthy(isStatusHealthy(parentStatus) && isStatusHealthy(childStatus));
        
        return dto;
    }

    private String getEntityName(DependencyType type, Long id) {
        switch (type) {
            case HTTP:
                return httpMonitorRepository.findById(id).map(HttpMonitor::getName).orElse("Unknown");
            case INSTANCE:
                return instanceRepository.findById(id).map(Instance::getName).orElse("Unknown");
            case SERVICE:
                return serviceRepository.findById(id).map(uptime.observability.domain.Service::getName).orElse("Unknown");
            default:
                return "Unknown";
        }
    }

    private String getEntityStatus(DependencyType type, Long id) {
        switch (type) {
            case HTTP:
                return httpHeartbeatRepository.findFirstByMonitorIdOrderByExecutedAtDesc(id)
                    .map(this::determineHttpStatus).orElse("UNKNOWN");
            case INSTANCE:
                return instanceHeartbeatRepository.findFirstByInstanceIdOrderByExecutedAtDesc(id)
                    .map(h -> h.getStatus().name()).orElse("UNKNOWN");
            case SERVICE:
                return serviceHeartbeatRepository.findFirstByServiceIdAndServiceInstanceIsNullOrderByExecutedAtDesc(id)
                    .map(h -> h.getStatus().name()).orElse("UNKNOWN");
            default:
                return "UNKNOWN";
        }
    }

    private String determineHttpStatus(HttpHeartbeat heartbeat) {
        if (!heartbeat.getSuccess()) return "DOWN";
        if (heartbeat.getResponseTimeMs() != null) {
            if (heartbeat.getCriticalThresholdMs() != null && heartbeat.getResponseTimeMs() > heartbeat.getCriticalThresholdMs()) {
                return "CRITICAL";
            }
            if (heartbeat.getWarningThresholdMs() != null && heartbeat.getResponseTimeMs() > heartbeat.getWarningThresholdMs()) {
                return "WARNING";
            }
        }
        return "UP";
    }

    private String calculateOverallStatus(List<HttpMonitorStatusDTO> httpStatuses) {
        if (httpStatuses.isEmpty()) return "UNKNOWN";
        
        long downCount = httpStatuses.stream().filter(s -> "DOWN".equals(s.getStatus())).count();
        long criticalCount = httpStatuses.stream().filter(s -> "CRITICAL".equals(s.getStatus())).count();
        long warningCount = httpStatuses.stream().filter(s -> "WARNING".equals(s.getStatus())).count();
        
        if (downCount > 0) return "DOWN";
        if (criticalCount > 0) return "CRITICAL";
        if (warningCount > 0) return "WARNING";
        return "UP";
    }

    private String calculateOverallPrivateStatus(
        List<HttpMonitorStatusDTO> httpStatuses,
        List<InstanceStatusDTO> instanceStatuses,
        List<ServiceStatusDTO> serviceStatuses
    ) {
        List<String> allStatuses = new ArrayList<>();
        httpStatuses.forEach(s -> allStatuses.add(s.getStatus()));
        instanceStatuses.forEach(s -> allStatuses.add(s.getStatus()));
        serviceStatuses.forEach(s -> allStatuses.add(s.getStatus()));
        
        if (allStatuses.isEmpty()) return "UNKNOWN";
        
        if (allStatuses.contains("DOWN")) return "DOWN";
        if (allStatuses.contains("CRITICAL")) return "CRITICAL";
        if (allStatuses.contains("WARNING") || allStatuses.contains("DEGRADED")) return "WARNING";
        return "UP";
    }

    private boolean isStatusHealthy(String status) {
        return "UP".equals(status);
    }
}