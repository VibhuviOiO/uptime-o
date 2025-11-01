package uptime.observability.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uptime.observability.domain.HttpHeartbeat;
import uptime.observability.repository.DatacenterRepository;
import uptime.observability.repository.HttpHeartbeatRepository;
import uptime.observability.repository.HttpMonitorRepository;
import uptime.observability.service.dto.*;

/**
 * Service for dashboard metrics and real-time monitoring data aggregation.
 * Provides efficient queries to minimize database load.
 */
@Service
@Transactional(readOnly = true)
public class DashboardService {

    private static final Logger LOG = LoggerFactory.getLogger(DashboardService.class);

    @Autowired
    private HttpHeartbeatRepository heartbeatRepository;

    @Autowired
    private HttpMonitorRepository monitorRepository;

    @Autowired
    private DatacenterRepository datacenterRepository;

    /**
     * Get overall dashboard metrics for specified period.
     * Uses aggregation queries to minimize database load.
     */
    public DashboardMetricsDTO getMetrics(Instant since) {
        LOG.debug("Computing metrics since: {}", since);

        Instant now = Instant.now();
        List<HttpHeartbeat> heartbeats = heartbeatRepository.findByExecutedAtAfter(since);

        if (heartbeats.isEmpty()) {
            LOG.warn("No heartbeats found for period");
            return new DashboardMetricsDTO(100.0, 0, 0L, 0L, 0, 0, 0, 0);
        }

        // Calculate aggregates
        long total = heartbeats.size();
        long successful = heartbeats.stream().filter(h -> Boolean.TRUE.equals(h.getSuccess())).count();
        long failed = total - successful;

        // Calculate response time average
        int avgResponseTime = heartbeats.stream()
            .mapToInt(h -> h.getResponseTimeMs() != null ? h.getResponseTimeMs() : 0)
            .reduce(0, Integer::sum) / (int) total;

        // Count degraded (slow but successful) and failed
        int degraded = (int) heartbeats.stream()
            .filter(h -> Boolean.TRUE.equals(h.getSuccess()) && h.getResponseTimeMs() != null &&
                h.getResponseTimeMs() > 500)
            .count();

        int failedCount = (int) failed;

        Double uptime = (successful * 100.0) / total;

        // Get total monitor count
        long monitorCount = monitorRepository.count();

        DashboardMetricsDTO metrics = new DashboardMetricsDTO(
            Math.round(uptime * 100.0) / 100.0,
            avgResponseTime,
            successful,
            failed,
            (int) monitorCount,
            (int) monitorCount,
            degraded,
            failedCount
        );

        return metrics;
    }

    /**
     * Get timeline data for charting last period status.
     */
    public TimelineDTO getTimeline(String period, Integer intervalMinutes) {
        LOG.debug("Computing timeline for period: {}, interval: {} minutes", period, intervalMinutes);

        Instant now = Instant.now();
        Instant startTime = parseTimePeriod(period);
        long intervalMillis = intervalMinutes * 60 * 1000L;

        List<HttpHeartbeat> heartbeats = heartbeatRepository.findByExecutedAtBetween(startTime, now);

        List<TimelinePointDTO> points = new ArrayList<>();
        Instant current = startTime;

        while (current.isBefore(now)) {
            Instant intervalEnd = current.plus(intervalMinutes, ChronoUnit.MINUTES);

            final Instant intervalStart = current;
            final Instant intervalEndFinal = intervalEnd;

            List<HttpHeartbeat> intervalHeartbeats = heartbeats.stream()
                .filter(h -> !h.getExecutedAt().isBefore(intervalStart) && h.getExecutedAt().isBefore(intervalEndFinal))
                .collect(Collectors.toList());

            if (!intervalHeartbeats.isEmpty()) {
                long successCount = intervalHeartbeats.stream()
                    .filter(h -> Boolean.TRUE.equals(h.getSuccess()))
                    .count();
                long failureCount = intervalHeartbeats.size() - successCount;

                int avgResponse = intervalHeartbeats.stream()
                    .mapToInt(h -> h.getResponseTimeMs() != null ? h.getResponseTimeMs() : 0)
                    .reduce(0, Integer::sum) / intervalHeartbeats.size();

                points.add(new TimelinePointDTO(current, successCount, failureCount, avgResponse));
            }

            current = intervalEnd;
        }

        return new TimelineDTO(points, startTime, now, period);
    }

    /**
     * Get datacenter status overview with aggregated metrics.
     */
    public List<DatacenterStatusDTO> getDatacenterStatus() {
        LOG.debug("Computing datacenter status");

        Instant since = Instant.now().minus(24, ChronoUnit.HOURS);

        return datacenterRepository.findAll().stream()
            .map(dc -> {
                List<HttpHeartbeat> dcHeartbeats = heartbeatRepository.findByDatacenterAndExecutedAtAfter(dc, since);

                DatacenterStatusDTO dto = new DatacenterStatusDTO();
                dto.setId(dc.getId());
                dto.setName(dc.getName());
                dto.setCode(dc.getCode());
                dto.setLastCheckTime(Instant.now());

                if (dcHeartbeats.isEmpty()) {
                    dto.setStatus("UNKNOWN");
                    dto.setUptime(100.0);
                    dto.setMonitorCount(0);
                    dto.setIssueCount(0);
                } else {
                    long successful = dcHeartbeats.stream()
                        .filter(h -> Boolean.TRUE.equals(h.getSuccess()))
                        .count();
                    double uptime = (successful * 100.0) / dcHeartbeats.size();
                    dto.setUptime(Math.round(uptime * 100.0) / 100.0);

                    int degraded = (int) dcHeartbeats.stream()
                        .filter(h -> Boolean.TRUE.equals(h.getSuccess()) && h.getResponseTimeMs() > 500)
                        .count();
                    int failed = (int) (dcHeartbeats.size() - successful);

                    dto.setStatus(failed > 0 ? "FAILED" : degraded > 0 ? "DEGRADED" : "HEALTHY");
                    dto.setMonitorCount((int) dc.getDatacenterMonitors().size());
                    dto.setDegradedCount(degraded);
                    dto.setFailedCount(failed);
                    dto.setIssueCount(degraded + failed);
                }

                dto.setAgentOnline((int) dc.getAgents().stream().filter(a -> a != null).count());
                dto.setAgentOffline(0);

                return dto;
            })
            .collect(Collectors.toList());
    }

    /**
     * Get top monitors by specified metric.
     */
    public List<MonitorStatusDTO> getTopMonitors(Integer limit, String orderBy) {
        LOG.debug("Computing top {} monitors ordered by: {}", limit, orderBy);

        Instant since = Instant.now().minus(24, ChronoUnit.HOURS);
        List<HttpHeartbeat> recentHeartbeats = heartbeatRepository.findByExecutedAtAfter(since);

        return monitorRepository.findAll().stream()
            .map(monitor -> {
                List<HttpHeartbeat> monitorHeartbeats = recentHeartbeats.stream()
                    .filter(h -> monitor.getId().equals(h.getMonitor().getId()))
                    .collect(Collectors.toList());

                MonitorStatusDTO dto = new MonitorStatusDTO();
                dto.setId(monitor.getId());
                dto.setName(monitor.getName());
                dto.setUrl(monitor.getUrl());

                if (monitorHeartbeats.isEmpty()) {
                    dto.setStatus("UNKNOWN");
                    dto.setSuccessRate(100.0);
                    dto.setAverageResponseTime(0);
                } else {
                    long successful = monitorHeartbeats.stream()
                        .filter(h -> Boolean.TRUE.equals(h.getSuccess()))
                        .count();
                    double successRate = (successful * 100.0) / monitorHeartbeats.size();
                    dto.setSuccessRate(Math.round(successRate * 100.0) / 100.0);

                    int avgResponse = monitorHeartbeats.stream()
                        .mapToInt(h -> h.getResponseTimeMs() != null ? h.getResponseTimeMs() : 0)
                        .reduce(0, Integer::sum) / monitorHeartbeats.size();
                    dto.setAverageResponseTime(avgResponse);

                    int failed = (int) (monitorHeartbeats.size() - successful);
                    dto.setStatus(failed > 0 ? "FAILED" : avgResponse > 500 ? "DEGRADED" : "HEALTHY");
                    dto.setFailureCount(failed);
                }

                dto.setDeployedDatacenters((int) monitor.getDatacenterMonitors().size());

                return dto;
            })
            .sorted((a, b) -> {
                if ("failureRate".equals(orderBy)) {
                    return Double.compare(b.getSuccessRate(), a.getSuccessRate());
                } else if ("responseTime".equals(orderBy)) {
                    return Integer.compare(b.getAverageResponseTime(), a.getAverageResponseTime());
                }
                return 0;
            })
            .limit(limit)
            .collect(Collectors.toList());
    }

    /**
     * Get health status summary.
     */
    public Map<String, Object> getHealthSummary() {
        LOG.debug("Computing health summary");

        Instant since = Instant.now().minus(24, ChronoUnit.HOURS);
        List<DatacenterStatusDTO> datacenters = getDatacenterStatus();

        long healthy = datacenters.stream().filter(d -> "HEALTHY".equals(d.getStatus())).count();
        long degraded = datacenters.stream().filter(d -> "DEGRADED".equals(d.getStatus())).count();
        long failed = datacenters.stream().filter(d -> "FAILED".equals(d.getStatus())).count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("healthy", healthy);
        summary.put("degraded", degraded);
        summary.put("failed", failed);
        summary.put("total", datacenters.size());
        summary.put("timestamp", Instant.now());

        return summary;
    }

    /**
     * Get region-wise metrics breakdown.
     */
    public List<Map<String, Object>> getRegionMetrics() {
        LOG.debug("Computing region-wise metrics");
        // TODO: Implement region metrics when Regions table has data
        return new ArrayList<>();
    }

    /**
     * Get SLA status for monitors.
     */
    public Map<String, Object> getSLAStatus(Double threshold) {
        LOG.debug("Computing SLA status with threshold: {}", threshold);

        List<MonitorStatusDTO> monitors = getTopMonitors(Integer.MAX_VALUE, "failureRate");

        long compliant = monitors.stream()
            .filter(m -> m.getSuccessRate() >= threshold)
            .count();

        Map<String, Object> slaStatus = new HashMap<>();
        slaStatus.put("compliant", compliant);
        slaStatus.put("nonCompliant", monitors.size() - compliant);
        slaStatus.put("threshold", threshold);
        slaStatus.put("complianceRate", monitors.isEmpty() ? 0 : (compliant * 100.0) / monitors.size());

        return slaStatus;
    }

    /**
     * Parse time period string to Instant.
     */
    private Instant parseTimePeriod(String period) {
        Instant now = Instant.now();
        if ("24h".equals(period)) {
            return now.minus(24, ChronoUnit.HOURS);
        } else if ("7d".equals(period)) {
            return now.minus(7, ChronoUnit.DAYS);
        } else if ("30d".equals(period)) {
            return now.minus(30, ChronoUnit.DAYS);
        }
        return now.minus(24, ChronoUnit.HOURS);
    }
}
