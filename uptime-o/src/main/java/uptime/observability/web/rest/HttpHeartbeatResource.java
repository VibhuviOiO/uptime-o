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
import uptime.observability.repository.HttpHeartbeatRepository;
import uptime.observability.service.HttpHeartbeatService;
import uptime.observability.service.dto.HttpHeartbeatDTO;

import uptime.observability.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link uptime.observability.domain.HttpHeartbeat}.
 */
@RestController
@RequestMapping("/api/http-heartbeats")
public class HttpHeartbeatResource {

    private static final Logger LOG = LoggerFactory.getLogger(HttpHeartbeatResource.class);

    private static final String ENTITY_NAME = "apiHeartbeat";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final HttpHeartbeatService apiHeartbeatService;

    private final HttpHeartbeatRepository apiHeartbeatRepository;

    public HttpHeartbeatResource(HttpHeartbeatService apiHeartbeatService, HttpHeartbeatRepository apiHeartbeatRepository) {
        this.apiHeartbeatService = apiHeartbeatService;
        this.apiHeartbeatRepository = apiHeartbeatRepository;
    }

    /**
     * {@code POST  /http-heartbeats} : Create a new apiHeartbeat.
     *
     * @param apiHeartbeatDTO the apiHeartbeatDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new apiHeartbeatDTO, or with status {@code 400 (Bad Request)} if the apiHeartbeat has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<HttpHeartbeatDTO> createHttpHeartbeat(@Valid @RequestBody HttpHeartbeatDTO apiHeartbeatDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save HttpHeartbeat : {}", apiHeartbeatDTO);
        if (apiHeartbeatDTO.getId() != null) {
            throw new BadRequestAlertException("A new apiHeartbeat cannot already have an ID", ENTITY_NAME, "idexists");
        }
        apiHeartbeatDTO = apiHeartbeatService.save(apiHeartbeatDTO);
        return ResponseEntity.created(new URI("/api/http-heartbeats/" + apiHeartbeatDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, apiHeartbeatDTO.getId().toString()))
            .body(apiHeartbeatDTO);
    }

    /**
     * {@code PUT  /http-heartbeats/:id} : Updates an existing apiHeartbeat.
     *
     * @param id the id of the apiHeartbeatDTO to save.
     * @param apiHeartbeatDTO the apiHeartbeatDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated apiHeartbeatDTO,
     * or with status {@code 400 (Bad Request)} if the apiHeartbeatDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the apiHeartbeatDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<HttpHeartbeatDTO> updateHttpHeartbeat(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody HttpHeartbeatDTO apiHeartbeatDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update HttpHeartbeat : {}, {}", id, apiHeartbeatDTO);
        if (apiHeartbeatDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, apiHeartbeatDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!apiHeartbeatRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        apiHeartbeatDTO = apiHeartbeatService.update(apiHeartbeatDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, apiHeartbeatDTO.getId().toString()))
            .body(apiHeartbeatDTO);
    }

    /**
     * {@code PATCH  /http-heartbeats/:id} : Partial updates given fields of an existing apiHeartbeat, field will ignore if it is null
     *
     * @param id the id of the apiHeartbeatDTO to save.
     * @param apiHeartbeatDTO the apiHeartbeatDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated apiHeartbeatDTO,
     * or with status {@code 400 (Bad Request)} if the apiHeartbeatDTO is not valid,
     * or with status {@code 404 (Not Found)} if the apiHeartbeatDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the apiHeartbeatDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<HttpHeartbeatDTO> partialUpdateHttpHeartbeat(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody HttpHeartbeatDTO apiHeartbeatDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update HttpHeartbeat partially : {}, {}", id, apiHeartbeatDTO);
        if (apiHeartbeatDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, apiHeartbeatDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!apiHeartbeatRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<HttpHeartbeatDTO> result = apiHeartbeatService.partialUpdate(apiHeartbeatDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, apiHeartbeatDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /http-heartbeats} : get all the apiHeartbeats.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of apiHeartbeats in body.
     */
    @GetMapping("")
    public ResponseEntity<List<HttpHeartbeatDTO>> getAllHttpHeartbeats(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get a page of HttpHeartbeats");
        Page<HttpHeartbeatDTO> page = apiHeartbeatService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /http-heartbeats/:id} : get the "id" apiHeartbeat.
     *
     * @param id the id of the apiHeartbeatDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the apiHeartbeatDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<HttpHeartbeatDTO> getHttpHeartbeat(@PathVariable("id") Long id) {
        LOG.debug("REST request to get HttpHeartbeat : {}", id);
        Optional<HttpHeartbeatDTO> apiHeartbeatDTO = apiHeartbeatService.findOne(id);
        return ResponseUtil.wrapOrNotFound(apiHeartbeatDTO);
    }

    /**
     * {@code DELETE  /http-heartbeats/:id} : delete the "id" apiHeartbeat.
     *
     * @param id the id of the apiHeartbeatDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHttpHeartbeat(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete HttpHeartbeat : {}", id);
        apiHeartbeatService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }


}
