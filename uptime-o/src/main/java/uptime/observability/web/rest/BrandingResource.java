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
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;
import uptime.observability.repository.BrandingRepository;
import uptime.observability.service.BrandingService;
import uptime.observability.service.dto.BrandingDTO;
import uptime.observability.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link uptime.observability.domain.Branding}.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class BrandingResource {

    @Value("${application.branding.enabled:false}")
    private boolean brandingEnabled;

    private static final Logger LOG = LoggerFactory.getLogger(BrandingResource.class);

    private static final String ENTITY_NAME = "branding";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final BrandingService brandingService;
    private final BrandingRepository brandingRepository;

    public BrandingResource(BrandingService brandingService, BrandingRepository brandingRepository) {
        this.brandingService = brandingService;
        this.brandingRepository = brandingRepository;
    }

    /**
     * {@code POST  /brandings} : Create a new branding.
     *
     * @param brandingDTO the brandingDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new brandingDTO, or with status {@code 400 (Bad Request)} if the branding has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/brandings")
    public ResponseEntity<BrandingDTO> createBranding(@Valid @RequestBody BrandingDTO brandingDTO) throws URISyntaxException {
        LOG.debug("REST request to save Branding : {}", brandingDTO);
        if (brandingDTO.getId() != null) {
            throw new BadRequestAlertException("A new branding cannot already have an ID", ENTITY_NAME, "idexists");
        }

        brandingDTO = brandingService.save(brandingDTO);
        return ResponseEntity.created(new URI("/api/brandings/" + brandingDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, brandingDTO.getId().toString()))
            .body(brandingDTO);
    }

    /**
     * {@code PUT  /brandings/:id} : Updates an existing branding.
     *
     * @param id the id of the brandingDTO to save.
     * @param brandingDTO the brandingDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated brandingDTO,
     * or with status {@code 400 (Bad Request)} if the brandingDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the brandingDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/brandings/{id}")
    public ResponseEntity<BrandingDTO> updateBranding(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody BrandingDTO brandingDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update Branding : {}, {}", id, brandingDTO);
        if (brandingDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, brandingDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!brandingRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        brandingDTO = brandingService.update(brandingDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, brandingDTO.getId().toString()))
            .body(brandingDTO);
    }

    /**
     * {@code GET  /brandings} : get all the brandings.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of brandings in body.
     */
    @GetMapping("/brandings")
    public ResponseEntity<List<BrandingDTO>> getAllBrandings(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of Brandings");
        Page<BrandingDTO> page = brandingService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /brandings/:id} : get the "id" branding.
     *
     * @param id the id of the brandingDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the brandingDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/brandings/{id}")
    public ResponseEntity<BrandingDTO> getBranding(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Branding : {}", id);
        Optional<BrandingDTO> brandingDTO = brandingService.findOne(id);
        return ResponseUtil.wrapOrNotFound(brandingDTO);
    }

    /**
     * {@code GET  /brandings/active} : get the active branding.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the brandingDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/brandings/active")
    public ResponseEntity<BrandingDTO> getActiveBranding() {
        LOG.debug("REST request to get active Branding");
        if (!brandingEnabled) {
            throw new BadRequestAlertException("Branding module is disabled", ENTITY_NAME, "disabled");
        }
        Optional<BrandingDTO> brandingDTO = brandingService.findActive();
        return ResponseUtil.wrapOrNotFound(brandingDTO);
    }

    /**
     * {@code GET  /public/brandings/active} : get the active branding (public access).
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the brandingDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/public/active")
    public ResponseEntity<BrandingDTO> getActiveBrandingPublic() {
        LOG.debug("Public REST request to get active Branding");
        if (!brandingEnabled) {
            return ResponseEntity.notFound().build();
        }
        Optional<BrandingDTO> brandingDTO = brandingService.findActive();
        return ResponseUtil.wrapOrNotFound(brandingDTO);
    }

    /**
     * {@code DELETE  /brandings/:id} : delete the "id" branding.
     *
     * @param id the id of the brandingDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (No Content)}.
     */
    @DeleteMapping("/brandings/{id}")
    public ResponseEntity<Void> deleteBranding(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Branding : {}", id);
        brandingService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}