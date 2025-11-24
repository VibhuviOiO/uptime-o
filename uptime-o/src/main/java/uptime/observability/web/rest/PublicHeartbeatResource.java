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

/**
 * Public REST controller for receiving HTTP heartbeats from external agents.
 * Supports both API key authentication (via X-API-Key header) and internal API calls.
 */
@RestController
@RequestMapping("/api/public/heartbeats")
public class PublicHeartbeatResource {

    private static final Logger LOG = LoggerFactory.getLogger(PublicHeartbeatResource.class);

    private static final String ENTITY_NAME = "httpHeartbeat";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final HttpHeartbeatService httpHeartbeatService;

    public PublicHeartbeatResource(HttpHeartbeatService httpHeartbeatService) {
        this.httpHeartbeatService = httpHeartbeatService;
    }

    /**
     * {@code POST  /api/public/heartbeats} : Submit a new HTTP heartbeat.
     * This endpoint can be called by:
     * 1. External agents with valid API key in X-API-Key header
     * 2. Internal services with proper authentication
     *
     * @param heartbeatDTO the heartbeat data to save.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new heartbeatDTO.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<HttpHeartbeatDTO> submitHeartbeat(@Valid @RequestBody HttpHeartbeatDTO heartbeatDTO)
        throws URISyntaxException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String authenticationType = authentication != null ? authentication.getName() : "anonymous";

        LOG.debug("REST request to submit HTTP Heartbeat from: {}, data: {}", authenticationType, heartbeatDTO);

        if (heartbeatDTO.getId() != null) {
            throw new BadRequestAlertException("A new heartbeat cannot already have an ID", ENTITY_NAME, "idexists");
        }

        HttpHeartbeatDTO result = httpHeartbeatService.save(heartbeatDTO);

        LOG.info("HTTP Heartbeat submitted successfully from: {}, ID: {}", authenticationType, result.getId());

        return ResponseEntity.created(new URI("/api/public/heartbeats/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code POST  /api/public/heartbeats/batch} : Submit multiple HTTP heartbeats in batch.
     * Useful for agents sending multiple heartbeat data points at once.
     *
     * @param heartbeats the list of heartbeat data to save.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)}.
     */
    @PostMapping("/batch")
    public ResponseEntity<Void> submitHeartbeatBatch(@Valid @RequestBody java.util.List<HttpHeartbeatDTO> heartbeats) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String authenticationType = authentication != null ? authentication.getName() : "anonymous";

        LOG.debug("REST request to submit {} HTTP Heartbeats in batch from: {}", heartbeats.size(), authenticationType);

        for (HttpHeartbeatDTO heartbeatDTO : heartbeats) {
            if (heartbeatDTO.getId() != null) {
                throw new BadRequestAlertException("Heartbeat in batch cannot have an ID", ENTITY_NAME, "idexists");
            }
            httpHeartbeatService.save(heartbeatDTO);
        }

        LOG.info("Batch of {} HTTP Heartbeats submitted successfully from: {}", heartbeats.size(), authenticationType);

        return ResponseEntity.ok()
            .headers(HeaderUtil.createAlert(applicationName, "Batch heartbeat submission successful", String.valueOf(heartbeats.size())))
            .build();
    }

    /**
     * {@code GET /api/public/heartbeats} : Get heartbeats with filters (public endpoint).
     */
    @GetMapping("")
    public ResponseEntity<java.util.List<HttpHeartbeatDTO>> getHeartbeats(
        @RequestParam(required = false) Long monitorId,
        @org.springdoc.core.annotations.ParameterObject org.springframework.data.domain.Pageable pageable
    ) {
        LOG.debug("Public request to get heartbeats for monitor: {}", monitorId);
        
        if (monitorId != null) {
            org.springframework.data.domain.Pageable largePageable = org.springframework.data.domain.PageRequest.of(
                0, 1000, pageable.getSort()
            );
            java.util.List<HttpHeartbeatDTO> heartbeats = httpHeartbeatService.findAll(largePageable).getContent().stream()
                .filter(dto -> dto.getMonitor() != null && dto.getMonitor().getId().equals(monitorId))
                .limit(pageable.getPageSize())
                .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(heartbeats);
        }
        
        return ResponseEntity.ok(httpHeartbeatService.findAll(pageable).getContent());
    }
}
