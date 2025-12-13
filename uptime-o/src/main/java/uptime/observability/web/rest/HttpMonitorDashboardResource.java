package uptime.observability.web.rest;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uptime.observability.repository.HttpMonitorRepository;
import uptime.observability.service.HttpMetricsService;

@RestController
@RequestMapping("/api/http-monitors")
public class HttpMonitorDashboardResource {

    private final HttpMonitorRepository monitorRepository;
    private final HttpMetricsService metricsService;

    public HttpMonitorDashboardResource(HttpMonitorRepository monitorRepository, HttpMetricsService metricsService) {
        this.monitorRepository = monitorRepository;
        this.metricsService = metricsService;
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        var metrics = metricsService.getIndividualMetrics(null, null, null, null);
        var stats = new HashMap<String, Object>();

        long totalMonitors = monitorRepository.count();
        long onlineMonitors = metrics.stream().filter(m -> m.getLastSuccess() != null && m.getLastSuccess()).count();
        long offlineMonitors = metrics.stream().filter(m -> m.getLastSuccess() != null && !m.getLastSuccess()).count();

        double avgResponseTime = metrics.stream()
            .filter(m -> m.getLastLatencyMs() != null && m.getLastLatencyMs() > 0)
            .mapToInt(m -> m.getLastLatencyMs())
            .average()
            .orElse(0.0);

        double uptimePercentage = totalMonitors > 0 ? (onlineMonitors * 100.0 / (onlineMonitors + offlineMonitors)) : 0.0;

        stats.put("totalMonitors", totalMonitors);
        stats.put("onlineMonitors", onlineMonitors);
        stats.put("offlineMonitors", offlineMonitors);
        stats.put("avgUptime", uptimePercentage);
        stats.put("avgResponseTime", avgResponseTime);
        stats.put("totalChecks", (long) metrics.size());

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/list")
    public ResponseEntity<List<Map<String, Object>>> getMonitorsList() {
        var monitors = monitorRepository.findAll();
        List<Map<String, Object>> list = monitors
            .stream()
            .map(m -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", m.getId());
                map.put("name", m.getName());
                return map;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }
}
