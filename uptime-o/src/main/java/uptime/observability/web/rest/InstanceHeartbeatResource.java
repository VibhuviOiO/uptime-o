package uptime.observability.web.rest;

import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
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
import uptime.observability.service.InstanceHeartbeatService;
import uptime.observability.service.dto.InstanceHeartbeatDTO;
import uptime.observability.web.rest.errors.BadRequestAlertException;

@RestController
@RequestMapping("/api/ping-heartbeats")
public class InstanceHeartbeatResource {

    private static final Logger LOG = LoggerFactory.getLogger(InstanceHeartbeatResource.class);
    private static final String ENTITY_NAME = "instanceHeartbeat";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final InstanceHeartbeatService instanceHeartbeatService;

    public InstanceHeartbeatResource(InstanceHeartbeatService instanceHeartbeatService) {
        this.instanceHeartbeatService = instanceHeartbeatService;
    }

    @PostMapping("")
    public ResponseEntity<InstanceHeartbeatDTO> createInstanceHeartbeat(@Valid @RequestBody InstanceHeartbeatDTO instanceHeartbeatDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save InstanceHeartbeat : {}", instanceHeartbeatDTO);
        if (instanceHeartbeatDTO.getId() != null) {
            throw new BadRequestAlertException("A new instanceHeartbeat cannot already have an ID", ENTITY_NAME, "idexists");
        }
        instanceHeartbeatDTO = instanceHeartbeatService.save(instanceHeartbeatDTO);
        return ResponseEntity.created(new URI("/api/ping-heartbeats/" + instanceHeartbeatDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, instanceHeartbeatDTO.getId().toString()))
            .body(instanceHeartbeatDTO);
    }

    @GetMapping("")
    public ResponseEntity<List<InstanceHeartbeatDTO>> getAllInstanceHeartbeats(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of InstanceHeartbeats");
        Page<InstanceHeartbeatDTO> page = instanceHeartbeatService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InstanceHeartbeatDTO> getInstanceHeartbeat(@PathVariable("id") Long id) {
        LOG.debug("REST request to get InstanceHeartbeat : {}", id);
        Optional<InstanceHeartbeatDTO> instanceHeartbeatDTO = instanceHeartbeatService.findOne(id);
        return ResponseUtil.wrapOrNotFound(instanceHeartbeatDTO);
    }

    @GetMapping("/instance/{instanceId}")
    public ResponseEntity<List<InstanceHeartbeatDTO>> getInstanceHeartbeatsByInstance(@PathVariable("instanceId") Long instanceId) {
        LOG.debug("REST request to get InstanceHeartbeats by Instance : {}", instanceId);
        List<InstanceHeartbeatDTO> heartbeats = instanceHeartbeatService.findByInstance(instanceId);
        return ResponseEntity.ok().body(heartbeats);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInstanceHeartbeat(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete InstanceHeartbeat : {}", id);
        instanceHeartbeatService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
