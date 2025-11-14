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
import uptime.observability.service.PingHeartbeatService;
import uptime.observability.service.dto.PingHeartbeatDTO;
import uptime.observability.web.rest.errors.BadRequestAlertException;

@RestController
@RequestMapping("/api/ping-heartbeats")
public class PingHeartbeatResource {

    private static final Logger LOG = LoggerFactory.getLogger(PingHeartbeatResource.class);
    private static final String ENTITY_NAME = "pingHeartbeat";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final PingHeartbeatService pingHeartbeatService;

    public PingHeartbeatResource(PingHeartbeatService pingHeartbeatService) {
        this.pingHeartbeatService = pingHeartbeatService;
    }

    @PostMapping("")
    public ResponseEntity<PingHeartbeatDTO> createPingHeartbeat(@Valid @RequestBody PingHeartbeatDTO pingHeartbeatDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save PingHeartbeat : {}", pingHeartbeatDTO);
        if (pingHeartbeatDTO.getId() != null) {
            throw new BadRequestAlertException("A new pingHeartbeat cannot already have an ID", ENTITY_NAME, "idexists");
        }
        pingHeartbeatDTO = pingHeartbeatService.save(pingHeartbeatDTO);
        return ResponseEntity.created(new URI("/api/ping-heartbeats/" + pingHeartbeatDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, pingHeartbeatDTO.getId().toString()))
            .body(pingHeartbeatDTO);
    }

    @GetMapping("")
    public ResponseEntity<List<PingHeartbeatDTO>> getAllPingHeartbeats(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of PingHeartbeats");
        Page<PingHeartbeatDTO> page = pingHeartbeatService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PingHeartbeatDTO> getPingHeartbeat(@PathVariable("id") Long id) {
        LOG.debug("REST request to get PingHeartbeat : {}", id);
        Optional<PingHeartbeatDTO> pingHeartbeatDTO = pingHeartbeatService.findOne(id);
        return ResponseUtil.wrapOrNotFound(pingHeartbeatDTO);
    }

    @GetMapping("/instance/{instanceId}")
    public ResponseEntity<List<PingHeartbeatDTO>> getPingHeartbeatsByInstance(@PathVariable("instanceId") Long instanceId) {
        LOG.debug("REST request to get PingHeartbeats by Instance : {}", instanceId);
        List<PingHeartbeatDTO> heartbeats = pingHeartbeatService.findByInstance(instanceId);
        return ResponseEntity.ok().body(heartbeats);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePingHeartbeat(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete PingHeartbeat : {}", id);
        pingHeartbeatService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
