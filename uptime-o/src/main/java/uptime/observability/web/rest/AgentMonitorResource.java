package uptime.observability.web.rest;

import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;
import uptime.observability.service.AgentMonitorService;
import uptime.observability.service.dto.AgentMonitorDTO;
import uptime.observability.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link uptime.observability.domain.AgentMonitor}.
 */
@RestController
@RequestMapping("/api/agent-monitors")
public class AgentMonitorResource {

    private static final Logger log = LoggerFactory.getLogger(AgentMonitorResource.class);

    private static final String ENTITY_NAME = "agentMonitor";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final AgentMonitorService agentMonitorService;

    public AgentMonitorResource(AgentMonitorService agentMonitorService) {
        this.agentMonitorService = agentMonitorService;
    }

    /**
     * {@code POST  /agent-monitors} : Create a new agentMonitor.
     *
     * @param agentMonitorDTO the agentMonitorDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new agentMonitorDTO, or with status {@code 400 (Bad Request)} if the agentMonitor has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<AgentMonitorDTO> createAgentMonitor(@Valid @RequestBody AgentMonitorDTO agentMonitorDTO)
        throws URISyntaxException {
        log.debug("REST request to save AgentMonitor : {}", agentMonitorDTO);
        if (agentMonitorDTO.getId() != null) {
            throw new BadRequestAlertException("A new agentMonitor cannot already have an ID", ENTITY_NAME, "idexists");
        }

        agentMonitorDTO = agentMonitorService.save(agentMonitorDTO);
        return ResponseEntity.created(new URI("/api/agent-monitors/" + agentMonitorDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, agentMonitorDTO.getId().toString()))
            .body(agentMonitorDTO);
    }

    /**
     * {@code PUT  /agent-monitors/:id} : Updates an existing agentMonitor.
     *
     * @param id the id of the agentMonitorDTO to save.
     * @param agentMonitorDTO the agentMonitorDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated agentMonitorDTO,
     * or with status {@code 400 (Bad Request)} if the agentMonitorDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the agentMonitorDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<AgentMonitorDTO> updateAgentMonitor(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody AgentMonitorDTO agentMonitorDTO
    ) throws URISyntaxException {
        log.debug("REST request to update AgentMonitor : {}, {}", id, agentMonitorDTO);
        if (agentMonitorDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, agentMonitorDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        agentMonitorDTO = agentMonitorService.update(agentMonitorDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, agentMonitorDTO.getId().toString()))
            .body(agentMonitorDTO);
    }

    /**
     * {@code PATCH  /agent-monitors/:id} : Partial updates given fields of an existing agentMonitor, field will ignore if it is null
     *
     * @param id the id of the agentMonitorDTO to save.
     * @param agentMonitorDTO the agentMonitorDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated agentMonitorDTO,
     * or with status {@code 400 (Bad Request)} if the agentMonitorDTO is not valid,
     * or with status {@code 404 (Not Found)} if the agentMonitorDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the agentMonitorDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<AgentMonitorDTO> partialUpdateAgentMonitor(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody AgentMonitorDTO agentMonitorDTO
    ) throws URISyntaxException {
        log.debug("REST request to partial update AgentMonitor partially : {}, {}", id, agentMonitorDTO);
        if (agentMonitorDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, agentMonitorDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        Optional<AgentMonitorDTO> result = agentMonitorService.partialUpdate(agentMonitorDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, agentMonitorDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /agent-monitors} : get all the agentMonitors.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of agentMonitors in body.
     */
    @GetMapping("")
    public List<AgentMonitorDTO> getAllAgentMonitors() {
        log.debug("REST request to get all AgentMonitors");
        return agentMonitorService.findAll();
    }

    /**
     * {@code GET  /agent-monitors/:id} : get the "id" agentMonitor.
     *
     * @param id the id of the agentMonitorDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the agentMonitorDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<AgentMonitorDTO> getAgentMonitor(@PathVariable("id") Long id) {
        log.debug("REST request to get AgentMonitor : {}", id);
        Optional<AgentMonitorDTO> agentMonitorDTO = agentMonitorService.findOne(id);
        return ResponseUtil.wrapOrNotFound(agentMonitorDTO);
    }

    /**
     * {@code GET  /agent-monitors/by-agent/:agentId} : get all agentMonitors by agent id.
     *
     * @param agentId the agent id.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of agentMonitors in body.
     */
    @GetMapping("/by-agent/{agentId}")
    public List<AgentMonitorDTO> getAgentMonitorsByAgentId(@PathVariable("agentId") Long agentId) {
        log.debug("REST request to get AgentMonitors by agent id : {}", agentId);
        return agentMonitorService.findByAgentId(agentId);
    }

    /**
     * {@code GET  /agent-monitors/by-monitor/:monitorId} : get all agentMonitors by monitor id.
     *
     * @param monitorId the monitor id.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of agentMonitors in body.
     */
    @GetMapping("/by-monitor/{monitorId}")
    public List<AgentMonitorDTO> getAgentMonitorsByMonitorId(@PathVariable("monitorId") Long monitorId) {
        log.debug("REST request to get AgentMonitors by monitor id : {}", monitorId);
        return agentMonitorService.findByMonitorId(monitorId);
    }

    /**
     * {@code DELETE  /agent-monitors/:id} : delete the "id" agentMonitor.
     *
     * @param id the id of the agentMonitorDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAgentMonitor(@PathVariable("id") Long id) {
        log.debug("REST request to delete AgentMonitor : {}", id);
        agentMonitorService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
