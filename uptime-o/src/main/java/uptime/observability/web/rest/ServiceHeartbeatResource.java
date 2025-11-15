package uptime.observability.web.rest;

import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
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
import uptime.observability.service.ServiceHeartbeatService;
import uptime.observability.service.dto.ServiceHeartbeatDTO;
import uptime.observability.web.rest.errors.BadRequestAlertException;

@RestController
@RequestMapping("/api/service-heartbeats")
public class ServiceHeartbeatResource {

    private static final Logger LOG = LoggerFactory.getLogger(ServiceHeartbeatResource.class);
    private static final String ENTITY_NAME = "serviceHeartbeat";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ServiceHeartbeatService serviceHeartbeatService;

    public ServiceHeartbeatResource(ServiceHeartbeatService serviceHeartbeatService) {
        this.serviceHeartbeatService = serviceHeartbeatService;
    }

    @PostMapping("")
    public ResponseEntity<ServiceHeartbeatDTO> createServiceHeartbeat(@Valid @RequestBody ServiceHeartbeatDTO serviceHeartbeatDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save ServiceHeartbeat : {}", serviceHeartbeatDTO);
        if (serviceHeartbeatDTO.getId() != null) {
            throw new BadRequestAlertException("A new serviceHeartbeat cannot already have an ID", ENTITY_NAME, "idexists");
        }
        serviceHeartbeatDTO = serviceHeartbeatService.save(serviceHeartbeatDTO);
        return ResponseEntity.created(new URI("/api/service-heartbeats/" + serviceHeartbeatDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, serviceHeartbeatDTO.getId().toString()))
            .body(serviceHeartbeatDTO);
    }

    @GetMapping("")
    public ResponseEntity<List<ServiceHeartbeatDTO>> getAllServiceHeartbeats(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get a page of ServiceHeartbeats");
        Page<ServiceHeartbeatDTO> page = serviceHeartbeatService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceHeartbeatDTO> getServiceHeartbeat(@PathVariable("id") Long id) {
        LOG.debug("REST request to get ServiceHeartbeat : {}", id);
        return ResponseUtil.wrapOrNotFound(serviceHeartbeatService.findOne(id));
    }
}
