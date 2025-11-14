package uptime.observability.web.rest;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import uptime.observability.domain.AgentMonitor;
import uptime.observability.domain.HttpMonitor;

import uptime.observability.repository.AgentMonitorRepository;

/**
 * Public REST controller for agents to fetch their assigned monitors.
 * Supports API key authentication (via X-API-Key header) handled by ApiKeyAuthenticationFilter.
 */
@RestController
@RequestMapping("/api/public/monitors")
public class PublicMonitorResource {

    private static final Logger LOG = LoggerFactory.getLogger(PublicMonitorResource.class);

    private final AgentMonitorRepository agentMonitorRepository;

    public PublicMonitorResource(AgentMonitorRepository agentMonitorRepository) {
        this.agentMonitorRepository = agentMonitorRepository;
    }

    /**
     * {@code GET /api/public/monitors?agentId={agentId}} : Get all active monitors assigned to an agent.
     * This endpoint can be called by:
     * 1. External agents with valid API key in X-API-Key header
     * 2. Internal services with proper authentication
     *
     * @param agentId the agent ID
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and list of monitors in body
     */
    @GetMapping("")
    public ResponseEntity<List<MonitorResponse>> getMonitorsByAgent(@RequestParam Long agentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String authenticationType = authentication != null ? authentication.getName() : "anonymous";

        LOG.debug("REST request to get monitors for agent: {} from: {}", agentId, authenticationType);

        // Get all active agent monitors for the agent with monitors and schedules eagerly loaded
        List<AgentMonitor> agentMonitors = agentMonitorRepository.findByAgentIdAndActiveWithMonitorAndSchedule(agentId, true);

        // Map to response DTOs
        List<MonitorResponse> monitors = agentMonitors
            .stream()
            .map(am -> {
                HttpMonitor monitor = am.getMonitor();

                MonitorResponse response = new MonitorResponse();
                response.setId(monitor.getId());
                response.setName(monitor.getName());
                response.setMethod(monitor.getMethod());
                response.setType(monitor.getType());
                response.setUrl(monitor.getUrl());
                response.setHeaders(monitor.getHeaders());
                response.setBody(monitor.getBody());
                response.setIntervalSeconds(monitor.getIntervalSeconds());
                response.setTimeoutSeconds(monitor.getTimeoutSeconds());
                response.setRetryCount(monitor.getRetryCount());
                response.setRetryDelaySeconds(monitor.getRetryDelaySeconds());

                return response;
            })
            .collect(Collectors.toList());

        LOG.info("Found {} monitors for agent: {} from: {}", monitors.size(), agentId, authenticationType);
        return ResponseEntity.ok(monitors);
    }

    // DTOs

    public static class MonitorResponse {

        private Long id;
        private String type;
        private String name;
        private String method;
        private String url;
        private JsonNode headers;
        private JsonNode body;
        private Integer intervalSeconds;
        private Integer timeoutSeconds;
        private Integer retryCount;
        private Integer retryDelaySeconds;

        // Getters and setters
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getMethod() {
            return method;
        }

        public void setMethod(String method) {
            this.method = method;
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public JsonNode getHeaders() {
            return headers;
        }

        public void setHeaders(JsonNode headers) {
            this.headers = headers;
        }

        public JsonNode getBody() {
            return body;
        }

        public void setBody(JsonNode body) {
            this.body = body;
        }

        public Integer getIntervalSeconds() {
            return intervalSeconds;
        }

        public void setIntervalSeconds(Integer intervalSeconds) {
            this.intervalSeconds = intervalSeconds;
        }

        public Integer getTimeoutSeconds() {
            return timeoutSeconds;
        }

        public void setTimeoutSeconds(Integer timeoutSeconds) {
            this.timeoutSeconds = timeoutSeconds;
        }

        public Integer getRetryCount() {
            return retryCount;
        }

        public void setRetryCount(Integer retryCount) {
            this.retryCount = retryCount;
        }

        public Integer getRetryDelaySeconds() {
            return retryDelaySeconds;
        }

        public void setRetryDelaySeconds(Integer retryDelaySeconds) {
            this.retryDelaySeconds = retryDelaySeconds;
        }
    }


}
