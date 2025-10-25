package uptime.observability.web.rest;

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
import uptime.observability.repository.DatacenterMonitorRepository;
import uptime.observability.service.DatacenterMonitorService;
import uptime.observability.service.dto.DatacenterMonitorDTO;
import uptime.observability.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link uptime.observability.domain.DatacenterMonitor}.
 */
@RestController
@RequestMapping("/api/datacenter-monitors")
public class DatacenterMonitorResource {

    private static final Logger LOG = LoggerFactory.getLogger(DatacenterMonitorResource.class);

    private static final String ENTITY_NAME = "datacenterMonitor";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final DatacenterMonitorService datacenterMonitorService;

    private final DatacenterMonitorRepository datacenterMonitorRepository;

    public DatacenterMonitorResource(
        DatacenterMonitorService datacenterMonitorService,
        DatacenterMonitorRepository datacenterMonitorRepository
    ) {
        this.datacenterMonitorService = datacenterMonitorService;
        this.datacenterMonitorRepository = datacenterMonitorRepository;
    }

    /**
     * {@code POST  /datacenter-monitors} : Create a new datacenterMonitor.
     *
     * @param datacenterMonitorDTO the datacenterMonitorDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new datacenterMonitorDTO, or with status {@code 400 (Bad Request)} if the datacenterMonitor has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<DatacenterMonitorDTO> createDatacenterMonitor(@RequestBody DatacenterMonitorDTO datacenterMonitorDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save DatacenterMonitor : {}", datacenterMonitorDTO);
        if (datacenterMonitorDTO.getId() != null) {
            throw new BadRequestAlertException("A new datacenterMonitor cannot already have an ID", ENTITY_NAME, "idexists");
        }
        datacenterMonitorDTO = datacenterMonitorService.save(datacenterMonitorDTO);
        return ResponseEntity.created(new URI("/api/datacenter-monitors/" + datacenterMonitorDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, datacenterMonitorDTO.getId().toString()))
            .body(datacenterMonitorDTO);
    }

    /**
     * {@code PUT  /datacenter-monitors/:id} : Updates an existing datacenterMonitor.
     *
     * @param id the id of the datacenterMonitorDTO to save.
     * @param datacenterMonitorDTO the datacenterMonitorDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated datacenterMonitorDTO,
     * or with status {@code 400 (Bad Request)} if the datacenterMonitorDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the datacenterMonitorDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<DatacenterMonitorDTO> updateDatacenterMonitor(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody DatacenterMonitorDTO datacenterMonitorDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update DatacenterMonitor : {}, {}", id, datacenterMonitorDTO);
        if (datacenterMonitorDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, datacenterMonitorDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!datacenterMonitorRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        datacenterMonitorDTO = datacenterMonitorService.update(datacenterMonitorDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, datacenterMonitorDTO.getId().toString()))
            .body(datacenterMonitorDTO);
    }

    /**
     * {@code PATCH  /datacenter-monitors/:id} : Partial updates given fields of an existing datacenterMonitor, field will ignore if it is null
     *
     * @param id the id of the datacenterMonitorDTO to save.
     * @param datacenterMonitorDTO the datacenterMonitorDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated datacenterMonitorDTO,
     * or with status {@code 400 (Bad Request)} if the datacenterMonitorDTO is not valid,
     * or with status {@code 404 (Not Found)} if the datacenterMonitorDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the datacenterMonitorDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<DatacenterMonitorDTO> partialUpdateDatacenterMonitor(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody DatacenterMonitorDTO datacenterMonitorDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update DatacenterMonitor partially : {}, {}", id, datacenterMonitorDTO);
        if (datacenterMonitorDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, datacenterMonitorDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!datacenterMonitorRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<DatacenterMonitorDTO> result = datacenterMonitorService.partialUpdate(datacenterMonitorDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, datacenterMonitorDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /datacenter-monitors} : get all the datacenterMonitors.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of datacenterMonitors in body.
     */
    @GetMapping("")
    public List<DatacenterMonitorDTO> getAllDatacenterMonitors() {
        LOG.debug("REST request to get all DatacenterMonitors");
        return datacenterMonitorService.findAll();
    }

    /**
     * {@code GET  /datacenter-monitors/:id} : get the "id" datacenterMonitor.
     *
     * @param id the id of the datacenterMonitorDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the datacenterMonitorDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<DatacenterMonitorDTO> getDatacenterMonitor(@PathVariable("id") Long id) {
        LOG.debug("REST request to get DatacenterMonitor : {}", id);
        Optional<DatacenterMonitorDTO> datacenterMonitorDTO = datacenterMonitorService.findOne(id);
        return ResponseUtil.wrapOrNotFound(datacenterMonitorDTO);
    }

    /**
     * {@code DELETE  /datacenter-monitors/:id} : delete the "id" datacenterMonitor.
     *
     * @param id the id of the datacenterMonitorDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDatacenterMonitor(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete DatacenterMonitor : {}", id);
        datacenterMonitorService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
