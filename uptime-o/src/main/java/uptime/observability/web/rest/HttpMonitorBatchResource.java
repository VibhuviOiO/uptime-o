package uptime.observability.web.rest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uptime.observability.service.MonitorDetailService;
import uptime.observability.service.dto.AgentMetricsDTO;
import uptime.observability.service.dto.TimeSeriesDataDTO;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/http-monitors")
public class HttpMonitorBatchResource {
    
    private static final Logger LOG = LoggerFactory.getLogger(HttpMonitorBatchResource.class);

    @Autowired
    private MonitorDetailService monitorDetailService;

    /**
     * GET /api/http-monitors/batch : Get metrics for multiple monitors in one call
     */
    @GetMapping("/batch")
    public ResponseEntity<Map<Long, BatchMonitorData>> getBatchMonitorData(
        @RequestParam List<Long> monitorIds,
        @RequestParam(required = false, defaultValue = "30m") String timeRange,
        @RequestParam(required = false) String agentRegion
    ) {
        LOG.info("REST request to get batch monitor data for {} monitors", monitorIds.size());
        
        try {
            Instant end = Instant.now();
            Instant start = calculateStartTime(timeRange, end);
            
            Map<Long, BatchMonitorData> result = new HashMap<>();
            
            // Fetch data for all monitors
            for (Long monitorId : monitorIds) {
                try {
                    List<AgentMetricsDTO> agentMetrics = monitorDetailService.getAgentMetrics(monitorId, start, end, agentRegion);
                    List<TimeSeriesDataDTO> timeSeriesData = monitorDetailService.getTimeSeriesData(monitorId, start, end, agentRegion);
                    
                    result.put(monitorId, new BatchMonitorData(agentMetrics, timeSeriesData));
                } catch (Exception e) {
                    LOG.error("Error fetching data for monitor {}: {}", monitorId, e.getMessage());
                    // Continue with other monitors
                }
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            LOG.error("Error in batch monitor data fetch", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private Instant calculateStartTime(String timeRange, Instant end) {
        return switch (timeRange) {
            case "5m" -> end.minusSeconds(5 * 60);
            case "15m" -> end.minusSeconds(15 * 60);
            case "30m" -> end.minusSeconds(30 * 60);
            case "1h" -> end.minusSeconds(60 * 60);
            case "4h" -> end.minusSeconds(4 * 60 * 60);
            case "24h" -> end.minusSeconds(24 * 60 * 60);
            case "2d" -> end.minusSeconds(2 * 24 * 60 * 60);
            case "7d" -> end.minusSeconds(7 * 24 * 60 * 60);
            case "30d" -> end.minusSeconds(30 * 24 * 60 * 60);
            default -> end.minusSeconds(30 * 60);
        };
    }

    public static class BatchMonitorData {
        private List<AgentMetricsDTO> agentMetrics;
        private List<TimeSeriesDataDTO> timeSeriesData;

        public BatchMonitorData(List<AgentMetricsDTO> agentMetrics, List<TimeSeriesDataDTO> timeSeriesData) {
            this.agentMetrics = agentMetrics;
            this.timeSeriesData = timeSeriesData;
        }

        public List<AgentMetricsDTO> getAgentMetrics() {
            return agentMetrics;
        }

        public List<TimeSeriesDataDTO> getTimeSeriesData() {
            return timeSeriesData;
        }
    }
}
