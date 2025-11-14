package uptime.observability.web.rest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import uptime.observability.domain.AgentMonitor;
import uptime.observability.domain.HttpHeartbeat;
import uptime.observability.repository.AgentMonitorRepository;
import uptime.observability.repository.HttpHeartbeatRepository;
import uptime.observability.service.dto.StatusPageDTO;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
public class StatusPageResource {

    private static final Logger LOG = LoggerFactory.getLogger(StatusPageResource.class);
    private final HttpHeartbeatRepository heartbeatRepository;
    private final AgentMonitorRepository agentMonitorRepository;

    public StatusPageResource(HttpHeartbeatRepository heartbeatRepository, AgentMonitorRepository agentMonitorRepository) {
        this.heartbeatRepository = heartbeatRepository;
        this.agentMonitorRepository = agentMonitorRepository;
    }

    @GetMapping("/status")
    @Transactional(readOnly = true)
    public ResponseEntity<StatusPageDTO> getStatusPage() {
        LOG.debug("REST request to get public status page");

        Instant fiveMinutesAgo = Instant.now().minus(5, ChronoUnit.MINUTES);
        List<HttpHeartbeat> recentHeartbeats = heartbeatRepository.findByExecutedAtAfter(fiveMinutesAgo);

        // Get all active agent-monitor assignments with eager loading
        List<AgentMonitor> activeAssignments = agentMonitorRepository.findByActiveWithRelationships(true);
        
        LOG.debug("Found {} active agent-monitor assignments", activeAssignments.size());
        for (AgentMonitor am : activeAssignments) {
            LOG.debug("  - Monitor: '{}' (ID: {}), Agent: '{}' (ID: {})", 
                am.getMonitor() != null ? am.getMonitor().getName() : "null",
                am.getMonitor() != null ? am.getMonitor().getId() : "null",
                am.getAgent() != null ? am.getAgent().getName() : "null",
                am.getAgent() != null ? am.getAgent().getId() : "null");
        }

        // Build expected monitor-region matrix from active assignments
        Map<Long, Set<String>> expectedMonitorRegions = new HashMap<>();
        Set<String> allRegions = new LinkedHashSet<>();
        Map<Long, String> monitorNames = new HashMap<>();

        for (AgentMonitor am : activeAssignments) {
            if (am.getMonitor() == null || am.getAgent() == null) continue;
            
            // Filter: Only include monitors with external visibility
            if (!"external".equals(am.getMonitor().getMonitoringVisibility())) {
                continue;
            }
            
            Long monitorId = am.getMonitor().getId();
            String regionName = am.getAgent().getDatacenter() != null && 
                               am.getAgent().getDatacenter().getRegion() != null
                ? am.getAgent().getDatacenter().getRegion().getName()
                : "Unknown";

            expectedMonitorRegions.computeIfAbsent(monitorId, k -> new HashSet<>()).add(regionName);
            allRegions.add(regionName);
            monitorNames.put(monitorId, am.getMonitor().getName());
            
            LOG.debug("Active assignment: Monitor '{}' (ID: {}) -> Agent '{}' in region '{}'", 
                am.getMonitor().getName(), monitorId, am.getAgent().getName(), regionName);
        }

        // Process heartbeats and build health status
        Map<Long, Map<String, StatusPageDTO.RegionHealth>> monitorRegionHealth = new HashMap<>();

        for (HttpHeartbeat hb : recentHeartbeats) {
            if (hb.getMonitor() == null || hb.getAgent() == null) continue;

            Long monitorId = hb.getMonitor().getId();
            Long agentId = hb.getAgent().getId();
            String regionName = hb.getAgent().getDatacenter() != null && 
                               hb.getAgent().getDatacenter().getRegion() != null
                ? hb.getAgent().getDatacenter().getRegion().getName()
                : "Unknown";

            // Only include if this agent-monitor assignment is still active
            boolean isActiveAssignment = activeAssignments.stream()
                .anyMatch(am -> am.getMonitor().getId().equals(monitorId) && 
                               am.getAgent().getId().equals(agentId) &&
                               Boolean.TRUE.equals(am.getActive()));

            if (!isActiveAssignment) {
                continue; // Skip old data from removed assignments
            }

            monitorRegionHealth
                .computeIfAbsent(monitorId, k -> new HashMap<>())
                .compute(regionName, (k, existing) -> {
                    // Keep most recent heartbeat
                    if (existing == null || (existing.getLastChecked() != null && 
                        hb.getExecutedAt().isAfter(existing.getLastChecked()))) {
                        String status = determineStatus(hb);
                        return new StatusPageDTO.RegionHealth(status, hb.getResponseTimeMs(), hb.getExecutedAt());
                    }
                    return existing;
                });
        }

        // Build final API status list with all expected regions
        List<StatusPageDTO.ApiStatus> apiStatuses = expectedMonitorRegions.entrySet().stream()
            .filter(entry -> !entry.getValue().isEmpty()) // Only include monitors with at least one active assignment
            .map(entry -> {
                Long monitorId = entry.getKey();
                Set<String> expectedRegions = entry.getValue();
                Map<String, StatusPageDTO.RegionHealth> regionHealth = monitorRegionHealth.getOrDefault(monitorId, new HashMap<>());

                // Fill in missing regions with null (will show as "—" in UI)
                for (String region : expectedRegions) {
                    regionHealth.putIfAbsent(region, null);
                }

                LOG.debug("Monitor {} ({}) has {} active regions: {}", 
                    monitorId, monitorNames.get(monitorId), expectedRegions.size(), expectedRegions);

                return new StatusPageDTO.ApiStatus(
                    monitorId,
                    monitorNames.get(monitorId),
                    regionHealth
                );
            })
            .sorted(Comparator.comparing(StatusPageDTO.ApiStatus::getApiName))
            .collect(Collectors.toList());

        LOG.debug("Status page returning {} monitors with data", apiStatuses.size());

        StatusPageDTO statusPage = new StatusPageDTO(apiStatuses, new ArrayList<>(allRegions));
        
        return ResponseEntity.ok()
            .cacheControl(CacheControl.noCache())
            .body(statusPage);
    }

    private String determineStatus(HttpHeartbeat hb) {
        if (!Boolean.TRUE.equals(hb.getSuccess())) {
            return "DOWN";
        }

        // Check for high latency (warning threshold)
        Integer responseTime = hb.getResponseTimeMs();
        Integer warningThreshold = hb.getWarningThresholdMs();
        Integer criticalThreshold = hb.getCriticalThresholdMs();

        if (criticalThreshold != null && responseTime != null && responseTime >= criticalThreshold) {
            return "CRITICAL";
        }

        if (warningThreshold != null && responseTime != null && responseTime >= warningThreshold) {
            return "WARNING";
        }

        return "UP";
    }
}
