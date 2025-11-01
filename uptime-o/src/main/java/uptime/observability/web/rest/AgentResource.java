package uptime.observability.web.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;
import uptime.observability.repository.AgentRepository;
import uptime.observability.service.AgentService;
import uptime.observability.service.dto.AgentDTO;
import uptime.observability.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link uptime.observability.domain.Agent}.
 */
@RestController
@RequestMapping("/api/agents")
public class AgentResource {

    private static final Logger LOG = LoggerFactory.getLogger(AgentResource.class);

    private static final String ENTITY_NAME = "agent";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final AgentService agentService;

    private final AgentRepository agentRepository;

    public AgentResource(AgentService agentService, AgentRepository agentRepository) {
        this.agentService = agentService;
        this.agentRepository = agentRepository;
    }

    /**
     * {@code POST  /agents} : Create a new agent.
     *
     * @param agentDTO the agentDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new agentDTO, or with status {@code 400 (Bad Request)} if the agent has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<AgentDTO> createAgent(@Valid @RequestBody AgentDTO agentDTO) throws URISyntaxException {
        LOG.debug("REST request to save Agent : {}", agentDTO);
        if (agentDTO.getId() != null) {
            throw new BadRequestAlertException("A new agent cannot already have an ID", ENTITY_NAME, "idexists");
        }
        agentDTO = agentService.save(agentDTO);
        return ResponseEntity.created(new URI("/api/agents/" + agentDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, agentDTO.getId().toString()))
            .body(agentDTO);
    }

    /**
     * {@code PUT  /agents/:id} : Updates an existing agent.
     *
     * @param id the id of the agentDTO to save.
     * @param agentDTO the agentDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated agentDTO,
     * or with status {@code 400 (Bad Request)} if the agentDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the agentDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<AgentDTO> updateAgent(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody AgentDTO agentDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update Agent : {}, {}", id, agentDTO);
        if (agentDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, agentDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!agentRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        agentDTO = agentService.update(agentDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, agentDTO.getId().toString()))
            .body(agentDTO);
    }

    /**
     * {@code PATCH  /agents/:id} : Partial updates given fields of an existing agent, field will ignore if it is null
     *
     * @param id the id of the agentDTO to save.
     * @param agentDTO the agentDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated agentDTO,
     * or with status {@code 400 (Bad Request)} if the agentDTO is not valid,
     * or with status {@code 404 (Not Found)} if the agentDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the agentDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<AgentDTO> partialUpdateAgent(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody AgentDTO agentDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Agent partially : {}, {}", id, agentDTO);
        if (agentDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, agentDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!agentRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<AgentDTO> result = agentService.partialUpdate(agentDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, agentDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /agents} : get all the agents.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of agents in body.
     */
    @GetMapping("")
    public ResponseEntity<List<AgentDTO>> getAllAgents(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of Agents");
        Page<AgentDTO> page = agentService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /agents/count} : get the count of agents.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the count.
     */
    @GetMapping("/count")
    public ResponseEntity<java.util.Map<String, Long>> getAgentCount() {
        LOG.debug("REST request to get Agent count");
        long count = agentRepository.count();
        return ResponseEntity.ok(java.util.Map.of("totalCount", count));
    }

    /**
     * {@code GET  /agents/:id} : get the "id" agent.
     *
     * @param id the id of the agentDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the agentDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<AgentDTO> getAgent(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Agent : {}", id);
        Optional<AgentDTO> agentDTO = agentService.findOne(id);
        return ResponseUtil.wrapOrNotFound(agentDTO);
    }

    /**
     * {@code DELETE  /agents/:id} : delete the "id" agent.
     *
     * @param id the id of the agentDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAgent(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Agent : {}", id);
        agentService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
