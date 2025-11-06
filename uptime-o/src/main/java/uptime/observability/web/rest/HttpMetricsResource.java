package uptime.observability.web.rest;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uptime.observability.service.HttpMetricsService;
import uptime.observability.service.dto.HttpMetricsDTO;

/**
 * REST controller for HTTP Metrics aggregation
 */
@RestController
@RequestMapping("/api/http-metrics")
public class HttpMetricsResource {

    private static final Logger LOG = LoggerFactory.getLogger(HttpMetricsResource.class);

    private final HttpMetricsService httpMetricsService;

    public HttpMetricsResource(HttpMetricsService httpMetricsService) {
        this.httpMetricsService = httpMetricsService;
    }

    /**
     * GET /api/http-metrics/aggregated : Get aggregated HTTP metrics
     *
     * @param searchName filter by monitor name (optional)
     * @param regionName filter by region (optional)
     * @param datacenterName filter by datacenter (optional)
     * @param agentName filter by agent name (optional)
     * @return the ResponseEntity with status 200 (OK) and the list of aggregated metrics
     */
    @GetMapping("/aggregated")
    public ResponseEntity<List<HttpMetricsDTO>> getAggregatedMetrics(
        @RequestParam(required = false) String searchName,
        @RequestParam(required = false) String regionName,
        @RequestParam(required = false) String datacenterName,
        @RequestParam(required = false) String agentName
    ) {
        LOG.debug("REST request to get aggregated HTTP metrics with filters");
        List<HttpMetricsDTO> metrics = httpMetricsService.getAggregatedMetrics(
            searchName,
            regionName,
            datacenterName,
            agentName
        );
        return ResponseEntity.ok(metrics);
    }
}
