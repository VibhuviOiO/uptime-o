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
import uptime.observability.domain.StatusDependency;
import uptime.observability.repository.StatusDependencyRepository;
import uptime.observability.web.rest.errors.BadRequestAlertException;

@RestController
@RequestMapping("/api")
public class StatusDependencyResource {

    private static final String ENTITY_NAME = "statusDependency";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final StatusDependencyRepository statusDependencyRepository;

    public StatusDependencyResource(StatusDependencyRepository statusDependencyRepository) {
        this.statusDependencyRepository = statusDependencyRepository;
    }

    /**
     * POST /status-dependencies : Create a new statusDependency.
     */
    @PostMapping("/status-dependencies")
    public ResponseEntity<StatusDependency> createStatusDependency(@Valid @RequestBody StatusDependency statusDependency) throws URISyntaxException {
        if (statusDependency.getId() != null) {
            throw new BadRequestAlertException("A new statusDependency cannot already have an ID", ENTITY_NAME, "idexists");
        }
        StatusDependency result = statusDependencyRepository.save(statusDependency);
        return ResponseEntity.created(new URI("/api/status-dependencies/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * GET /status-dependencies : get all the statusDependencies.
     */
    @GetMapping("/status-dependencies")
    public ResponseEntity<List<StatusDependency>> getAllStatusDependencies(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        Page<StatusDependency> page = statusDependencyRepository.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET /status-dependencies/:id : get the "id" statusDependency.
     */
    @GetMapping("/status-dependencies/{id}")
    public ResponseEntity<StatusDependency> getStatusDependency(@PathVariable("id") Long id) {
        Optional<StatusDependency> statusDependency = statusDependencyRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(statusDependency);
    }

    /**
     * PUT /status-dependencies/:id : Updates an existing statusDependency.
     */
    @PutMapping("/status-dependencies/{id}")
    public ResponseEntity<StatusDependency> updateStatusDependency(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody StatusDependency statusDependency
    ) throws URISyntaxException {
        if (statusDependency.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!statusDependency.getId().equals(id)) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        if (!statusDependencyRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }
        StatusDependency result = statusDependencyRepository.save(statusDependency);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, statusDependency.getId().toString()))
            .body(result);
    }

    /**
     * DELETE /status-dependencies/:id : delete the "id" statusDependency.
     */
    @DeleteMapping("/status-dependencies/{id}")
    public ResponseEntity<Void> deleteStatusDependency(@PathVariable("id") Long id) {
        statusDependencyRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}