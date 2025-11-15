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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;
import uptime.observability.service.ServiceService;
import uptime.observability.service.dto.ServiceDTO;
import uptime.observability.web.rest.errors.BadRequestAlertException;

@RestController
@RequestMapping("/api/services")
public class ServiceResource {

    private static final Logger LOG = LoggerFactory.getLogger(ServiceResource.class);
    private static final String ENTITY_NAME = "service";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ServiceService serviceService;

    public ServiceResource(ServiceService serviceService) {
        this.serviceService = serviceService;
    }

    @PostMapping("")
    public ResponseEntity<ServiceDTO> createService(@Valid @RequestBody ServiceDTO serviceDTO) throws URISyntaxException {
        LOG.debug("REST request to save Service : {}", serviceDTO);
        if (serviceDTO.getId() != null) {
            throw new BadRequestAlertException("A new service cannot already have an ID", ENTITY_NAME, "idexists");
        }
        serviceDTO = serviceService.save(serviceDTO);
        return ResponseEntity.created(new URI("/api/services/" + serviceDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, serviceDTO.getId().toString()))
            .body(serviceDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceDTO> updateService(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody ServiceDTO serviceDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update Service : {}, {}", id, serviceDTO);
        if (serviceDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, serviceDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        serviceDTO = serviceService.update(serviceDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, serviceDTO.getId().toString()))
            .body(serviceDTO);
    }

    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ServiceDTO> partialUpdateService(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody ServiceDTO serviceDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Service partially : {}, {}", id, serviceDTO);
        if (serviceDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, serviceDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        Optional<ServiceDTO> result = serviceService.partialUpdate(serviceDTO);
        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, serviceDTO.getId().toString())
        );
    }

    @GetMapping("")
    public ResponseEntity<List<ServiceDTO>> getAllServices(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of Services");
        Page<ServiceDTO> page = serviceService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceDTO> getService(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Service : {}", id);
        Optional<ServiceDTO> serviceDTO = serviceService.findOne(id);
        return ResponseUtil.wrapOrNotFound(serviceDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Service : {}", id);
        serviceService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
