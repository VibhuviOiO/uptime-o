package uptime.observability.web.rest;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uptime.observability.service.DashboardService;
import uptime.observability.service.dto.DashboardMetricsDTO;
import uptime.observability.service.dto.DatacenterStatusDTO;
import uptime.observability.service.dto.MonitorStatusDTO;
import uptime.observability.service.dto.TimelineDTO;

/**
 * REST controller for dashboard metrics and real-time monitoring data.
 */
@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardResource {

    private static final Logger LOG = LoggerFactory.getLogger(DashboardResource.class);

    @Autowired
    private DashboardService dashboardService;

    /**
     * Get overall dashboard metrics.
     * Includes uptime %, response time, monitor counts, and failure statistics.
     *
     * @param periodHours how many hours back to analyze (default 24)
     * @return aggregated metrics
     */
    @GetMapping("/metrics")
    public ResponseEntity<DashboardMetricsDTO> getMetrics(
        @RequestParam(defaultValue = "24") Integer periodHours
    ) {
        LOG.debug("Fetching dashboard metrics for period: {} hours", periodHours);
        Instant since = Instant.now().minus(periodHours, ChronoUnit.HOURS);
        DashboardMetricsDTO metrics = dashboardService.getMetrics(since);
        return ResponseEntity.ok(metrics);
    }

    /**
     * Get timeline data for charting last 24h status.
     *
     * @param period time period (24h, 7d, etc)
     * @param intervalMinutes size of each interval (15, 30, 60)
     * @return timeline points with success/failure counts
     */
    @GetMapping("/timeline")
    public ResponseEntity<TimelineDTO> getTimeline(
        @RequestParam(defaultValue = "24h") String period,
        @RequestParam(defaultValue = "15") Integer intervalMinutes
    ) {
        LOG.debug("Fetching timeline for period: {}, interval: {} minutes", period, intervalMinutes);
        TimelineDTO timeline = dashboardService.getTimeline(period, intervalMinutes);
        return ResponseEntity.ok(timeline);
    }

    /**
     * Get datacenter status overview with aggregated metrics.
     * Shows health, uptime %, issue counts, agent status.
     *
     * @return list of datacenter statuses
     */
    @GetMapping("/datacenter-status")
    public ResponseEntity<List<DatacenterStatusDTO>> getDatacenterStatus() {
        LOG.debug("Fetching datacenter status overview");
        List<DatacenterStatusDTO> status = dashboardService.getDatacenterStatus();
        return ResponseEntity.ok(status);
    }

    /**
     * Get top monitors by metric (failures, slow response, degradation).
     *
     * @param limit how many to return
     * @param orderBy field to sort by (failureRate, responseTime, slaViolation)
     * @return list of monitor statuses
     */
    @GetMapping("/top-monitors")
    public ResponseEntity<List<MonitorStatusDTO>> getTopMonitors(
        @RequestParam(defaultValue = "5") Integer limit,
        @RequestParam(defaultValue = "failureRate") String orderBy
    ) {
        LOG.debug("Fetching top {} monitors ordered by: {}", limit, orderBy);
        List<MonitorStatusDTO> monitors = dashboardService.getTopMonitors(limit, orderBy);
        return ResponseEntity.ok(monitors);
    }

    /**
     * Get health status summary (healthy, degraded, failed counts).
     *
     * @return health status breakdown
     */
    @GetMapping("/health-summary")
    public ResponseEntity<Map<String, Object>> getHealthSummary() {
        LOG.debug("Fetching health summary");
        Map<String, Object> summary = dashboardService.getHealthSummary();
        return ResponseEntity.ok(summary);
    }

    /**
     * Get region-wise metrics breakdown.
     *
     * @return metrics per region
     */
    @GetMapping("/region-metrics")
    public ResponseEntity<List<Map<String, Object>>> getRegionMetrics() {
        LOG.debug("Fetching region-wise metrics");
        List<Map<String, Object>> regionMetrics = dashboardService.getRegionMetrics();
        return ResponseEntity.ok(regionMetrics);
    }

    /**
     * Get SLA compliance status for all monitors.
     *
     * @param threshold SLA threshold to check against (default 99.5)
     * @return SLA compliance status
     */
    @GetMapping("/sla-status")
    public ResponseEntity<Map<String, Object>> getSLAStatus(
        @RequestParam(defaultValue = "99.5") Double threshold
    ) {
        LOG.debug("Fetching SLA status with threshold: {}", threshold);
        Map<String, Object> slaStatus = dashboardService.getSLAStatus(threshold);
        return ResponseEntity.ok(slaStatus);
    }
}
