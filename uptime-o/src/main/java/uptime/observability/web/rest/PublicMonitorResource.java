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
import uptime.observability.domain.Schedule;
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
                Schedule schedule = monitor.getSchedule();

                MonitorResponse response = new MonitorResponse();
                response.setId(monitor.getId());
                response.setName(monitor.getName());
                response.setMethod(monitor.getMethod());
                response.setType(monitor.getType());
                response.setUrl(monitor.getUrl());
                response.setAdditionalUrls(monitor.getAdditionalUrls());
                response.setCallsPerInterval(monitor.getCallsPerInterval());
                response.setHeaders(monitor.getHeaders());
                response.setBody(monitor.getBody());

                if (schedule != null) {
                    ScheduleResponse scheduleResponse = new ScheduleResponse();
                    scheduleResponse.setId(schedule.getId());
                    scheduleResponse.setName(schedule.getName());
                    scheduleResponse.setInterval(schedule.getInterval());
                    scheduleResponse.setIncludeResponseBody(schedule.getIncludeResponseBody());
                    scheduleResponse.setThresholdsWarning(schedule.getThresholdsWarning());
                    scheduleResponse.setThresholdsCritical(schedule.getThresholdsCritical());
                    response.setSchedule(scheduleResponse);
                }

                return response;
            })
            .collect(Collectors.toList());

        LOG.info("Found {} monitors for agent: {} from: {}", monitors.size(), agentId, authenticationType);
        return ResponseEntity.ok(monitors);
    }

    // DTOs

    public static class MonitorResponse {

        private Long id;
        private String name;
        private String method;
        private String type;
        private String url;
        private JsonNode additionalUrls;
        private Integer callsPerInterval;
        private JsonNode headers;
        private JsonNode body;
        private ScheduleResponse schedule;

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

        public String getMethod() {
            return method;
        }

        public void setMethod(String method) {
            this.method = method;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public JsonNode getAdditionalUrls() {
            return additionalUrls;
        }

        public void setAdditionalUrls(JsonNode additionalUrls) {
            this.additionalUrls = additionalUrls;
        }

        public Integer getCallsPerInterval() {
            return callsPerInterval;
        }

        public void setCallsPerInterval(Integer callsPerInterval) {
            this.callsPerInterval = callsPerInterval;
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

        public ScheduleResponse getSchedule() {
            return schedule;
        }

        public void setSchedule(ScheduleResponse schedule) {
            this.schedule = schedule;
        }
    }

    public static class ScheduleResponse {

        private Long id;
        private String name;
        private Integer interval;
        private Integer callsPerInterval;
        private Boolean includeResponseBody;
        private Integer thresholdsWarning;
        private Integer thresholdsCritical;

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

        public Integer getInterval() {
            return interval;
        }

        public void setInterval(Integer interval) {
            this.interval = interval;
        }

        public Integer getCallsPerInterval() {
            return callsPerInterval;
        }

        public void setCallsPerInterval(Integer callsPerInterval) {
            this.callsPerInterval = callsPerInterval;
        }

        public Boolean getIncludeResponseBody() {
            return includeResponseBody;
        }

        public void setIncludeResponseBody(Boolean includeResponseBody) {
            this.includeResponseBody = includeResponseBody;
        }

        public Integer getThresholdsWarning() {
            return thresholdsWarning;
        }

        public void setThresholdsWarning(Integer thresholdsWarning) {
            this.thresholdsWarning = thresholdsWarning;
        }

        public Integer getThresholdsCritical() {
            return thresholdsCritical;
        }

        public void setThresholdsCritical(Integer thresholdsCritical) {
            this.thresholdsCritical = thresholdsCritical;
        }
    }
}
