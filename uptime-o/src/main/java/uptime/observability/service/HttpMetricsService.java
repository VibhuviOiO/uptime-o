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
            List<Object[]> results = httpHeartbeatRepository.findAggregatedMetrics(
                searchName, regionName, datacenterName, agentName
            );
            
            return results.stream()
                .map(row -> new HttpMetricsDTO(
                    ((Number) row[0]).longValue(),  // monitor_id
                    (String) row[1],                 // monitor_name
                    (Boolean) row[2],                // last_success
                    ((Number) row[8]).intValue(),    // agent_count
                    (String) row[5],                 // region_name
                    (String) row[6],                 // datacenter_name
                    (String) row[7],                 // agent_name
                    row[4] != null ? ((java.sql.Timestamp) row[4]).toInstant() : null, // last_checked_time
                    row[3] != null ? ((Number) row[3]).intValue() : 0  // last_latency_ms
                ))
                .collect(Collectors.<HttpMetricsDTO>toList());
        } catch (Exception e) {
            LOG.error("Exception in getAggregatedMetrics() with cause = '{}' and exception = '{}'", e.getCause(), e.getMessage(), e);
            throw e;
        }
    }

}
