package uptime.observability.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import jakarta.validation.Valid;
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
import uptime.observability.domain.StatusPage;
import uptime.observability.repository.StatusPageRepository;
import uptime.observability.service.StatusPageService;
import uptime.observability.service.dto.StatusPageDTO.*;
import uptime.observability.web.rest.errors.BadRequestAlertException;

@RestController
@RequestMapping("/api")
public class StatusPageResource {

    private static final String ENTITY_NAME = "statusPage";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final StatusPageRepository statusPageRepository;
    private final StatusPageService statusPageService;

    public StatusPageResource(StatusPageRepository statusPageRepository, StatusPageService statusPageService) {
        this.statusPageRepository = statusPageRepository;
        this.statusPageService = statusPageService;
    }

    /**
     * GET /public/status : Get public status page data
     * Shows only HTTP monitors with basic UP/DOWN status
     */
    @GetMapping("/public/status")
    public ResponseEntity<PublicStatusDTO> getPublicStatus() {
        PublicStatusDTO status = statusPageService.getPublicStatus();
        return ResponseEntity.ok(status);
    }

    /**
     * GET /status : Get private status page data (requires authentication)
     * Shows all monitoring data with dependencies and detailed metrics
     */
    @GetMapping("/status")
    public ResponseEntity<PrivateStatusDTO> getPrivateStatus() {
        PrivateStatusDTO status = statusPageService.getPrivateStatus();
        return ResponseEntity.ok(status);
    }

    /**
     * GET /public/status-page/:slug : Get public status page configuration by slug
     */
    @GetMapping("/public/status-page/{slug}")
    public ResponseEntity<StatusPage> getPublicStatusPageBySlug(@PathVariable("slug") String slug) {
        Optional<StatusPage> statusPage = statusPageRepository.findBySlug(slug);
        return ResponseUtil.wrapOrNotFound(statusPage);
    }

    /**
     * GET /status-pages/by-slug/:slug : Get status page configuration by slug (authenticated)
     */
    @GetMapping("/status-pages/by-slug/{slug}")
    public ResponseEntity<StatusPage> getStatusPageBySlug(@PathVariable("slug") String slug) {
        Optional<StatusPage> statusPage = statusPageRepository.findBySlug(slug);
        return ResponseUtil.wrapOrNotFound(statusPage);
    }

    /**
     * POST /status-pages : Create a new statusPage.
     */
    @PostMapping("/status-pages")
    public ResponseEntity<StatusPage> createStatusPage(@Valid @RequestBody StatusPage statusPage) throws URISyntaxException {
        if (statusPage.getId() != null) {
            throw new BadRequestAlertException("A new statusPage cannot already have an ID", ENTITY_NAME, "idexists");
        }
        StatusPage result = statusPageRepository.save(statusPage);
        return ResponseEntity.created(new URI("/api/status-pages/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * GET /status-pages : get all the statusPages.
     */
    @GetMapping("/status-pages")
    public ResponseEntity<List<StatusPage>> getAllStatusPages(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        Page<StatusPage> page = statusPageRepository.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET /status-pages/:id : get the "id" statusPage.
     */
    @GetMapping("/status-pages/{id}")
    public ResponseEntity<StatusPage> getStatusPage(@PathVariable("id") Long id) {
        Optional<StatusPage> statusPage = statusPageRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(statusPage);
    }

    /**
     * PUT /status-pages/:id : Updates an existing statusPage.
     */
    @PutMapping("/status-pages/{id}")
    public ResponseEntity<StatusPage> updateStatusPage(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody StatusPage statusPage
    ) throws URISyntaxException {
        if (statusPage.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!statusPage.getId().equals(id)) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        if (!statusPageRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }
        StatusPage result = statusPageRepository.save(statusPage);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, statusPage.getId().toString()))
            .body(result);
    }

    /**
     * DELETE /status-pages/:id : delete the "id" statusPage.
     */
    @DeleteMapping("/status-pages/{id}")
    public ResponseEntity<Void> deleteStatusPage(@PathVariable("id") Long id) {
        statusPageRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}