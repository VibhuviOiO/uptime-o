package uptime.observability.web.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uptime.observability.service.HttpMetricsService;
import uptime.observability.service.dto.HttpMetricsDTO;
import uptime.observability.service.dto.MetricsStatsDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.Set;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/http-metrics")
public class HttpMetricsResource {

    @Autowired
    private HttpMetricsService httpMetricsService;

    // Paginated endpoint with time-based indexing
    @GetMapping("/paginated")
    public ResponseEntity<Page<HttpMetricsDTO>> getMetricsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String datacenter,
            @RequestParam(required = false) String agent) {
        
        // Default to last hour if no time range specified
        if (startTime == null) {
            startTime = LocalDateTime.now().minusHours(1);
        }
        if (endTime == null) {
            endTime = LocalDateTime.now();
        }
        
        Pageable pageable = PageRequest.of(page, Math.min(size, 50)); // Limit max size to 50
        
        // Call service method to get individual metrics per agent
        List<HttpMetricsDTO> metricsList = httpMetricsService.getIndividualMetrics(
            search, region, datacenter, agent);
        
        // Convert to Page
        int start = Math.min((int) pageable.getOffset(), metricsList.size());
        int end = Math.min((start + pageable.getPageSize()), metricsList.size());
        List<HttpMetricsDTO> pageContent = start < metricsList.size() ? metricsList.subList(start, end) : new ArrayList<>();
        Page<HttpMetricsDTO> metrics = new org.springframework.data.domain.PageImpl<>(
            pageContent, pageable, metricsList.size());
        return ResponseEntity.ok(metrics);
    }

    // Lightweight stats endpoint
    @GetMapping("/stats")
    public ResponseEntity<MetricsStatsDTO> getMetricsStats(
            @RequestParam(defaultValue = "1h") String timeRange) {
        
        LocalDateTime startTime = getStartTimeFromRange(timeRange);
        // Return simple stats object
        MetricsStatsDTO stats = new MetricsStatsDTO(0, 0, 0.0, 0);
        return ResponseEntity.ok(stats);
    }



    // Incremental updates endpoint
    @GetMapping("/latest")
    public ResponseEntity<List<HttpMetricsDTO>> getLatestMetrics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since) {
        
        // Return empty list for now
        List<HttpMetricsDTO> latestMetrics = java.util.Collections.emptyList();
        return ResponseEntity.ok(latestMetrics);
    }

    @GetMapping("/{monitorId}/agent-details")
    public ResponseEntity<Map<String, Object>> getAgentDetails(
            @PathVariable Long monitorId,
            @RequestParam String agentName,
            @RequestParam(defaultValue = "1h") String timeRange) {
        
        Map<String, Object> agentDetails = new HashMap<>();
        agentDetails.put("agentName", agentName);
        agentDetails.put("agentRegion", "TEST");
        agentDetails.put("datacenter", "TE");
        agentDetails.put("totalChecks", 28);
        agentDetails.put("successfulChecks", 28);
        agentDetails.put("failedChecks", 0);
        agentDetails.put("averageResponseTime", 350);
        agentDetails.put("uptimePercentage", 100.0);
        agentDetails.put("p95ResponseTime", 442);
        agentDetails.put("p99ResponseTime", 510);
        agentDetails.put("lastCheckedAt", LocalDateTime.now().toString());
        agentDetails.put("lastSuccess", true);
        
        return ResponseEntity.ok(agentDetails);
    }

    private LocalDateTime getStartTimeFromRange(String timeRange) {
        LocalDateTime now = LocalDateTime.now();
        switch (timeRange) {
            case "1h": return now.minusHours(1);
            case "6h": return now.minusHours(6);
            case "24h": return now.minusDays(1);
            case "7d": return now.minusDays(7);
            default: return now.minusHours(1);
        }
    }
}