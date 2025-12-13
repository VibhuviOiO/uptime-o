package uptime.observability.web.rest;

import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import uptime.observability.service.HttpHeartbeatService;
import uptime.observability.service.dto.HttpHeartbeatDTO;
import uptime.observability.web.rest.errors.BadRequestAlertException;
import uptime.observability.repository.AgentMonitorRepository;
import uptime.observability.domain.AgentMonitor;
import uptime.observability.domain.HttpMonitor;
import uptime.observability.domain.Schedule;
import uptime.observability.web.rest.PublicMonitorResource.MonitorResponse;
import uptime.observability.web.rest.PublicMonitorResource.ScheduleResponse;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
import java.util.stream.Collectors;
import uptime.observability.repository.AgentLockRepository;
import uptime.observability.domain.AgentLock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import org.springframework.http.HttpStatus;

/**
 * Agent-only REST controller for agent operations.
 * All endpoints require API_AGENT authority.
 */
@RestController
@RequestMapping("/api/agent")
public class AgentApiResource {

    private static final Logger LOG = LoggerFactory.getLogger(AgentApiResource.class);
    private static final String ENTITY_NAME = "httpHeartbeat";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final HttpHeartbeatService httpHeartbeatService;
    private final AgentMonitorRepository agentMonitorRepository;
    private final AgentLockRepository agentLockRepository;
    private static final int LOCK_TTL_SECONDS = 60;

    public AgentApiResource(HttpHeartbeatService httpHeartbeatService, AgentMonitorRepository agentMonitorRepository, AgentLockRepository agentLockRepository) {
        this.httpHeartbeatService = httpHeartbeatService;
        this.agentMonitorRepository = agentMonitorRepository;
        this.agentLockRepository = agentLockRepository;
    }

    /**
     * {@code POST /api/agent/heartbeats} : Submit a single heartbeat from agent.
     */
    @PostMapping("/heartbeats")
    public ResponseEntity<HttpHeartbeatDTO> submitHeartbeat(@Valid @RequestBody HttpHeartbeatDTO heartbeatDTO)
        throws URISyntaxException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String agentName = authentication != null ? authentication.getName() : "unknown-agent";

        LOG.debug("Agent heartbeat submission from: {}", agentName);

        if (heartbeatDTO.getId() != null) {
            throw new BadRequestAlertException("A new heartbeat cannot already have an ID", ENTITY_NAME, "idexists");
        }

        HttpHeartbeatDTO result = httpHeartbeatService.save(heartbeatDTO);
        LOG.info("Agent heartbeat submitted successfully from: {}, ID: {}", agentName, result.getId());

        return ResponseEntity.created(new URI("/api/agent/heartbeats/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code POST /api/agent/heartbeats/batch} : Submit multiple heartbeats in batch from agent.
     */
    @PostMapping("/heartbeats/batch")
    public ResponseEntity<Void> submitHeartbeatBatch(@Valid @RequestBody java.util.List<HttpHeartbeatDTO> heartbeats) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String agentName = authentication != null ? authentication.getName() : "unknown-agent";

        LOG.debug("Agent batch heartbeat submission from: {}, count: {}", agentName, heartbeats.size());

        for (HttpHeartbeatDTO heartbeatDTO : heartbeats) {
            if (heartbeatDTO.getId() != null) {
                throw new BadRequestAlertException("Heartbeat in batch cannot have an ID", ENTITY_NAME, "idexists");
            }
            httpHeartbeatService.save(heartbeatDTO);
        }

        LOG.info("Agent batch heartbeats submitted successfully from: {}, count: {}", agentName, heartbeats.size());

        return ResponseEntity.ok()
            .headers(HeaderUtil.createAlert(applicationName, "Agent batch heartbeat submission successful", String.valueOf(heartbeats.size())))
            .build();
    }

    /**
     * {@code GET /api/agent/monitors} : Get monitors assigned to agent.
     */
    @GetMapping("/monitors")
    public ResponseEntity<List<MonitorResponse>> getAgentMonitors(@RequestParam Long agentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String agentName = authentication != null ? authentication.getName() : "unknown-agent";

        LOG.debug("Agent monitors request from: {}, agentId: {}", agentName, agentId);

        List<AgentMonitor> agentMonitors = agentMonitorRepository.findByAgentIdAndActiveWithMonitorAndSchedule(agentId, true);

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

        LOG.info("Found {} monitors for agent: {} from: {}", monitors.size(), agentId, agentName);
        return ResponseEntity.ok(monitors);
    }

    /**
     * {@code POST /api/agent/lock} : Acquire leadership lock for agent.
     */
    @PostMapping("/lock")
    public ResponseEntity<Void> acquireLock(@RequestParam Long agentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String agentName = authentication != null ? authentication.getName() : "unknown-agent";

        LOG.debug("Agent lock acquisition request from: {}, agentId: {}", agentName, agentId);

        Optional<AgentLock> existingLock = agentLockRepository.findById(agentId);
        Instant now = Instant.now();

        if (existingLock.isPresent()) {
            AgentLock lock = existingLock.orElseThrow();
            // Check if lock is expired
            if (lock.getExpiresAt().isAfter(now)) {
                LOG.debug("Lock for agent {} is held by another instance", agentId);
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            // Lock expired, update it
            lock.setAcquiredAt(now);
            lock.setExpiresAt(now.plus(LOCK_TTL_SECONDS, ChronoUnit.SECONDS));
            agentLockRepository.save(lock);
            LOG.info("Agent {} acquired expired lock from: {}", agentId, agentName);
            return ResponseEntity.ok().build();
        }

        // Create new lock
        AgentLock newLock = new AgentLock();
        newLock.setAgentId(agentId);
        newLock.setAcquiredAt(now);
        newLock.setExpiresAt(now.plus(LOCK_TTL_SECONDS, ChronoUnit.SECONDS));
        agentLockRepository.save(newLock);

        LOG.info("Agent {} acquired new lock from: {}", agentId, agentName);
        return ResponseEntity.ok().build();
    }

    /**
     * {@code DELETE /api/agent/lock} : Release leadership lock for agent.
     */
    @DeleteMapping("/lock")
    public ResponseEntity<Void> releaseLock(@RequestParam Long agentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String agentName = authentication != null ? authentication.getName() : "unknown-agent";

        LOG.debug("Agent lock release request from: {}, agentId: {}", agentName, agentId);
        
        agentLockRepository.deleteById(agentId);
        
        LOG.info("Agent lock released for agent: {} from: {}", agentId, agentName);
        return ResponseEntity.ok().build();
    }
}