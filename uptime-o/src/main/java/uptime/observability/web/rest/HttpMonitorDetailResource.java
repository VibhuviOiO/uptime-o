package uptime.observability.web.rest;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uptime.observability.service.MonitorDetailService;
import uptime.observability.service.dto.*;

/**
 * REST controller for Monitor Detail operations
 */
@RestController
@RequestMapping("/api/http-monitors")
public class HttpMonitorDetailResource {

    private static final Logger LOG = LoggerFactory.getLogger(HttpMonitorDetailResource.class);

    @Autowired
    private MonitorDetailService monitorDetailService;

    /**
     * GET /api/http-monitors/{id}/details : Get detailed monitor information with statistics
     *
     * @param id the monitor ID
     * @return the ResponseEntity with status 200 (OK) and the monitor detail in body
     */
    @GetMapping("/{id}/details")
    public ResponseEntity<MonitorDetailDTO> getMonitorDetail(@PathVariable Long id) {
        LOG.info("REST request to get monitor detail for ID: {}", id);
        
        try {
            MonitorDetailDTO detail = monitorDetailService.getMonitorDetail(id);
            LOG.info("Successfully fetched monitor detail for ID: {}", id);
            return ResponseEntity.ok(detail);
        } catch (Exception e) {
            LOG.error("Error fetching monitor detail for ID: {}, error: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * GET /api/http-monitors/{id}/agent-metrics : Get agent-wise metrics breakdown
     *
     * @param id the monitor ID
     * @param timeRange time range filter (5m, 15m, 30m, 1h, 4h, 24h, 2d, 7d, 30d) - default 30m
     * @param startTime custom start time (ISO 8601 format)
     * @param endTime custom end time (ISO 8601 format)
     * @param agentRegion filter by agent region (optional)
     * @return the ResponseEntity with status 200 (OK) and list of agent metrics in body
     */
    @GetMapping("/{id}/agent-metrics")
    public ResponseEntity<List<AgentMetricsDTO>> getAgentMetrics(
        @PathVariable Long id,
        @RequestParam(required = false, defaultValue = "30m") String timeRange,
        @RequestParam(required = false) Instant startTime,
        @RequestParam(required = false) Instant endTime,
        @RequestParam(required = false) String agentRegion
    ) {
        LOG.debug("REST request to get agent metrics for monitor ID: {}, timeRange: {}, region: {}", 
            id, timeRange, agentRegion);

        // Calculate time range
        Instant start = startTime;
        Instant end = endTime != null ? endTime : Instant.now();

        if (start == null) {
            start = calculateStartTime(timeRange, end);
        }

        try {
            List<AgentMetricsDTO> metrics = monitorDetailService.getAgentMetrics(id, start, end, agentRegion);
            return ResponseEntity.ok(metrics);
        } catch (RuntimeException e) {
            LOG.error("Error fetching agent metrics for monitor ID: {}", id, e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/http-monitors/{id}/time-series : Get time-series data for charts
     *
     * @param id the monitor ID
     * @param timeRange time range filter (5m, 15m, 30m, 1h, 4h, 24h, 2d, 7d, 30d) - default 30m
     * @param startTime custom start time (ISO 8601 format)
     * @param endTime custom end time (ISO 8601 format)
     * @param agentRegion filter by agent region (optional)
     * @return the ResponseEntity with status 200 (OK) and list of time-series data in body
     */
    @GetMapping("/{id}/time-series")
    public ResponseEntity<List<TimeSeriesDataDTO>> getTimeSeriesData(
        @PathVariable Long id,
        @RequestParam(required = false, defaultValue = "30m") String timeRange,
        @RequestParam(required = false) Instant startTime,
        @RequestParam(required = false) Instant endTime,
        @RequestParam(required = false) String agentRegion
    ) {
        LOG.debug("REST request to get time-series data for monitor ID: {}, timeRange: {}, region: {}", 
            id, timeRange, agentRegion);

        // Calculate time range
        Instant start = startTime;
        Instant end = endTime != null ? endTime : Instant.now();

        if (start == null) {
            start = calculateStartTime(timeRange, end);
        }

        try {
            List<TimeSeriesDataDTO> data = monitorDetailService.getTimeSeriesData(id, start, end, agentRegion);
            return ResponseEntity.ok(data);
        } catch (RuntimeException e) {
            LOG.error("Error fetching time-series data for monitor ID: {}", id, e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/http-monitors/{id}/complete : Get all monitor data in one call
     */
    @GetMapping("/{id}/complete")
    public ResponseEntity<MonitorCompleteDataDTO> getCompleteMonitorData(
        @PathVariable Long id,
        @RequestParam(required = false, defaultValue = "30m") String timeRange,
        @RequestParam(required = false) String agentRegion
    ) {
        LOG.info("REST request to get complete monitor data for ID: {}", id);
        
        try {
            Instant end = Instant.now();
            Instant start = calculateStartTime(timeRange, end);
            
            // Get all data in parallel
            MonitorDetailDTO detail = monitorDetailService.getMonitorDetail(id);
            List<AgentMetricsDTO> agentMetrics = monitorDetailService.getAgentMetrics(id, start, end, agentRegion);
            List<TimeSeriesDataDTO> timeSeriesData = monitorDetailService.getTimeSeriesData(id, start, end, agentRegion);
            
            MonitorCompleteDataDTO completeData = new MonitorCompleteDataDTO(detail, agentMetrics, timeSeriesData);
            return ResponseEntity.ok(completeData);
        } catch (Exception e) {
            LOG.error("Error fetching complete monitor data for ID: {}", id, e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Calculate start time based on time range string
     */
    private Instant calculateStartTime(String timeRange, Instant endTime) {
        return switch (timeRange) {
            case "5m" -> endTime.minus(5, ChronoUnit.MINUTES);
            case "15m" -> endTime.minus(15, ChronoUnit.MINUTES);
            case "30m" -> endTime.minus(30, ChronoUnit.MINUTES);
            case "1h" -> endTime.minus(1, ChronoUnit.HOURS);
            case "4h" -> endTime.minus(4, ChronoUnit.HOURS);
            case "24h" -> endTime.minus(24, ChronoUnit.HOURS);
            case "2d" -> endTime.minus(2, ChronoUnit.DAYS);
            case "7d" -> endTime.minus(7, ChronoUnit.DAYS);
            case "30d" -> endTime.minus(30, ChronoUnit.DAYS);
            default -> endTime.minus(30, ChronoUnit.MINUTES);
        };
    }
}
