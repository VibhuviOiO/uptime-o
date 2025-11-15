package uptime.observability.service;

import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uptime.observability.domain.*;
import uptime.observability.repository.*;
import uptime.observability.service.dto.HttpMetricsDTO;

/**
 * Service for aggregating HTTP Heartbeat metrics
 */
@Service
public class HttpMetricsService {
    private static final Logger LOG = LoggerFactory.getLogger(HttpMetricsService.class);

    @Autowired
    private HttpHeartbeatRepository httpHeartbeatRepository;

    @Autowired
    private HttpMonitorRepository httpMonitorRepository;

    /**
     * Get aggregated HTTP metrics for all monitors
     *
     * @param searchName filter by monitor name (optional)
     * @param regionName filter by region (optional)
     * @param datacenterName filter by datacenter (optional)
     * @param agentName filter by agent name (optional)
     * @return list of aggregated metrics
     */
    public List<HttpMetricsDTO> getAggregatedMetrics(
        String searchName,
        String regionName,
        String datacenterName,
        String agentName
    ) {
        LOG.debug("Fetching aggregated HTTP metrics with filters - search: {}, region: {}, datacenter: {}, agent: {}",
            searchName, regionName, datacenterName, agentName);

        try {
            List<HttpMonitor> monitors = httpMonitorRepository.findAll();

            return monitors.stream()
                .map(monitor -> buildMetricsDTO(monitor, searchName, regionName, datacenterName, agentName))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        } catch (Exception e) {
            LOG.error("Exception in getAggregatedMetrics() with cause = '{}' and exception = '{}'", e.getCause(), e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Build metrics DTO for a single monitor
     */
    private HttpMetricsDTO buildMetricsDTO(
        HttpMonitor monitor,
        String searchName,
        String regionName,
        String datacenterName,
        String agentName
    ) {
        // Filter by name
        if (searchName != null && !searchName.isEmpty()) {
            if (!monitor.getName().toLowerCase().contains(searchName.toLowerCase())) {
                return null;
            }
        }

        // Get latest heartbeat for this monitor
        HttpHeartbeat latestHeartbeat = httpHeartbeatRepository
            .findByMonitorIdOrderByExecutedAtDesc(monitor.getId())
            .stream()
            .findFirst()
            .orElse(null);

        if (latestHeartbeat == null) {
            return null;
        }

        // Get agent's datacenter and region information
        Agent agent = latestHeartbeat.getAgent();
        if (agent == null) {
            return null;
        }

        Region region = agent.getRegion();

        // Filter by region
        if (regionName != null && !regionName.isEmpty()) {
            if (region == null || !region.getName().equalsIgnoreCase(regionName)) {
                return null;
            }
        }



        // Filter by agent
        if (agentName != null && !agentName.isEmpty()) {
            if (!agent.getName().toLowerCase().contains(agentName.toLowerCase())) {
                return null;
            }
        }

        // Count unique agents checking this monitor
        Integer agentCount = httpHeartbeatRepository.countDistinctAgentsByMonitorId(monitor.getId());

        // Build DTO
        HttpMetricsDTO dto = new HttpMetricsDTO(
            monitor.getId(),
            monitor.getName(),
            latestHeartbeat.getSuccess(),
            agentCount != null ? agentCount : 0,
            region != null ? region.getName() : "-",
            region != null ? region.getName() : "-",
            agent.getName(),
            latestHeartbeat.getExecutedAt(),
            latestHeartbeat.getResponseTimeMs() != null ? latestHeartbeat.getResponseTimeMs() : 0
        );

        return dto;
    }
}
