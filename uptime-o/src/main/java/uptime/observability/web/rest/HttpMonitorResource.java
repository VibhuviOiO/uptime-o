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
import uptime.observability.repository.HttpMonitorRepository;
import uptime.observability.service.HttpMonitorService;
import uptime.observability.service.dto.HttpMonitorDTO;
import uptime.observability.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link uptime.observability.domain.HttpMonitor}.
 */
@RestController
@RequestMapping("/api/http-monitors")
public class HttpMonitorResource {

    private static final Logger LOG = LoggerFactory.getLogger(HttpMonitorResource.class);

    private static final String ENTITY_NAME = "httpMonitor";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final HttpMonitorService apiMonitorService;

    private final HttpMonitorRepository apiMonitorRepository;

    public HttpMonitorResource(HttpMonitorService apiMonitorService, HttpMonitorRepository apiMonitorRepository) {
        this.apiMonitorService = apiMonitorService;
        this.apiMonitorRepository = apiMonitorRepository;
    }

    /**
     * {@code POST  /http-monitors} : Create a new httpMonitor.
     *
     * @param apiMonitorDTO the apiMonitorDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new apiMonitorDTO, or with status {@code 400 (Bad Request)} if the httpMonitor has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<HttpMonitorDTO> createHttpMonitor(@Valid @RequestBody HttpMonitorDTO apiMonitorDTO) throws URISyntaxException {
        LOG.debug("REST request to save HttpMonitor : {}", apiMonitorDTO);
        if (apiMonitorDTO.getId() != null) {
            throw new BadRequestAlertException("A new httpMonitor cannot already have an ID", ENTITY_NAME, "idexists");
        }
        apiMonitorDTO = apiMonitorService.save(apiMonitorDTO);
        return ResponseEntity.created(new URI("/api/http-monitors/" + apiMonitorDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, apiMonitorDTO.getId().toString()))
            .body(apiMonitorDTO);
    }

    /**
     * {@code PUT  /http-monitors/:id} : Updates an existing httpMonitor.
     *
     * @param id the id of the apiMonitorDTO to save.
     * @param apiMonitorDTO the apiMonitorDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated apiMonitorDTO,
     * or with status {@code 400 (Bad Request)} if the apiMonitorDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the apiMonitorDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<HttpMonitorDTO> updateHttpMonitor(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody HttpMonitorDTO apiMonitorDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update HttpMonitor : {}, {}", id, apiMonitorDTO);
        if (apiMonitorDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, apiMonitorDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!apiMonitorRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        apiMonitorDTO = apiMonitorService.update(apiMonitorDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, apiMonitorDTO.getId().toString()))
            .body(apiMonitorDTO);
    }

    /**
     * {@code PATCH  /http-monitors/:id} : Partial updates given fields of an existing httpMonitor, field will ignore if it is null
     *
     * @param id the id of the apiMonitorDTO to save.
     * @param apiMonitorDTO the apiMonitorDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated apiMonitorDTO,
     * or with status {@code 400 (Bad Request)} if the apiMonitorDTO is not valid,
     * or with status {@code 404 (Not Found)} if the apiMonitorDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the apiMonitorDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<HttpMonitorDTO> partialUpdateHttpMonitor(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody HttpMonitorDTO apiMonitorDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update HttpMonitor partially : {}, {}", id, apiMonitorDTO);
        if (apiMonitorDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, apiMonitorDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!apiMonitorRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<HttpMonitorDTO> result = apiMonitorService.partialUpdate(apiMonitorDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, apiMonitorDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /http-monitors} : get all the httpMonitors.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of httpMonitors in body.
     */
    @GetMapping("")
    public ResponseEntity<List<HttpMonitorDTO>> getAllHttpMonitors(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of HttpMonitors");
        Page<HttpMonitorDTO> page = apiMonitorService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /http-monitors/:id} : get the "id" httpMonitor.
     *
     * @param id the id of the apiMonitorDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the apiMonitorDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<HttpMonitorDTO> getHttpMonitor(@PathVariable("id") Long id) {
        LOG.debug("REST request to get HttpMonitor : {}", id);
        Optional<HttpMonitorDTO> apiMonitorDTO = apiMonitorService.findOne(id);
        return ResponseUtil.wrapOrNotFound(apiMonitorDTO);
    }

    /**
     * {@code DELETE  /http-monitors/:id} : delete the "id" httpMonitor.
     *
     * @param id the id of the apiMonitorDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHttpMonitor(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete HttpMonitor : {}", id);
        apiMonitorService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
