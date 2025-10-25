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
import uptime.observability.repository.DatacenterRepository;
import uptime.observability.service.DatacenterService;
import uptime.observability.service.dto.DatacenterDTO;
import uptime.observability.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link uptime.observability.domain.Datacenter}.
 */
@RestController
@RequestMapping("/api/datacenters")
public class DatacenterResource {

    private static final Logger LOG = LoggerFactory.getLogger(DatacenterResource.class);

    private static final String ENTITY_NAME = "datacenter";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final DatacenterService datacenterService;

    private final DatacenterRepository datacenterRepository;

    public DatacenterResource(DatacenterService datacenterService, DatacenterRepository datacenterRepository) {
        this.datacenterService = datacenterService;
        this.datacenterRepository = datacenterRepository;
    }

    /**
     * {@code POST  /datacenters} : Create a new datacenter.
     *
     * @param datacenterDTO the datacenterDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new datacenterDTO, or with status {@code 400 (Bad Request)} if the datacenter has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<DatacenterDTO> createDatacenter(@Valid @RequestBody DatacenterDTO datacenterDTO) throws URISyntaxException {
        LOG.debug("REST request to save Datacenter : {}", datacenterDTO);
        if (datacenterDTO.getId() != null) {
            throw new BadRequestAlertException("A new datacenter cannot already have an ID", ENTITY_NAME, "idexists");
        }
        datacenterDTO = datacenterService.save(datacenterDTO);
        return ResponseEntity.created(new URI("/api/datacenters/" + datacenterDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, datacenterDTO.getId().toString()))
            .body(datacenterDTO);
    }

    /**
     * {@code PUT  /datacenters/:id} : Updates an existing datacenter.
     *
     * @param id the id of the datacenterDTO to save.
     * @param datacenterDTO the datacenterDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated datacenterDTO,
     * or with status {@code 400 (Bad Request)} if the datacenterDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the datacenterDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<DatacenterDTO> updateDatacenter(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody DatacenterDTO datacenterDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update Datacenter : {}, {}", id, datacenterDTO);
        if (datacenterDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, datacenterDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!datacenterRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        datacenterDTO = datacenterService.update(datacenterDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, datacenterDTO.getId().toString()))
            .body(datacenterDTO);
    }

    /**
     * {@code PATCH  /datacenters/:id} : Partial updates given fields of an existing datacenter, field will ignore if it is null
     *
     * @param id the id of the datacenterDTO to save.
     * @param datacenterDTO the datacenterDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated datacenterDTO,
     * or with status {@code 400 (Bad Request)} if the datacenterDTO is not valid,
     * or with status {@code 404 (Not Found)} if the datacenterDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the datacenterDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<DatacenterDTO> partialUpdateDatacenter(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody DatacenterDTO datacenterDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Datacenter partially : {}, {}", id, datacenterDTO);
        if (datacenterDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, datacenterDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!datacenterRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<DatacenterDTO> result = datacenterService.partialUpdate(datacenterDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, datacenterDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /datacenters} : get all the datacenters.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of datacenters in body.
     */
    @GetMapping("")
    public ResponseEntity<List<DatacenterDTO>> getAllDatacenters(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of Datacenters");
        Page<DatacenterDTO> page = datacenterService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /datacenters/:id} : get the "id" datacenter.
     *
     * @param id the id of the datacenterDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the datacenterDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<DatacenterDTO> getDatacenter(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Datacenter : {}", id);
        Optional<DatacenterDTO> datacenterDTO = datacenterService.findOne(id);
        return ResponseUtil.wrapOrNotFound(datacenterDTO);
    }

    /**
     * {@code DELETE  /datacenters/:id} : delete the "id" datacenter.
     *
     * @param id the id of the datacenterDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDatacenter(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Datacenter : {}", id);
        datacenterService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
