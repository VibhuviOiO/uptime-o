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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;
import uptime.observability.service.InstanceService;
import uptime.observability.service.dto.InstanceDTO;
import uptime.observability.web.rest.errors.BadRequestAlertException;

@RestController
@RequestMapping("/api/instances")
public class InstanceResource {

    private static final Logger LOG = LoggerFactory.getLogger(InstanceResource.class);
    private static final String ENTITY_NAME = "instance";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final InstanceService instanceService;

    public InstanceResource(InstanceService instanceService) {
        this.instanceService = instanceService;
    }

    @PostMapping("")
    public ResponseEntity<InstanceDTO> createInstance(@Valid @RequestBody InstanceDTO instanceDTO) throws URISyntaxException {
        LOG.debug("REST request to save Instance : {}", instanceDTO);
        if (instanceDTO.getId() != null) {
            throw new BadRequestAlertException("A new instance cannot already have an ID", ENTITY_NAME, "idexists");
        }
        instanceDTO = instanceService.save(instanceDTO);
        return ResponseEntity.created(new URI("/api/instances/" + instanceDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, instanceDTO.getId().toString()))
            .body(instanceDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InstanceDTO> updateInstance(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody InstanceDTO instanceDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update Instance : {}, {}", id, instanceDTO);
        if (instanceDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, instanceDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        instanceDTO = instanceService.update(instanceDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, instanceDTO.getId().toString()))
            .body(instanceDTO);
    }

    @GetMapping("")
    public List<InstanceDTO> getAllInstances() {
        LOG.debug("REST request to get all Instances");
        return instanceService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<InstanceDTO> getInstance(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Instance : {}", id);
        Optional<InstanceDTO> instanceDTO = instanceService.findOne(id);
        return ResponseUtil.wrapOrNotFound(instanceDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInstance(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Instance : {}", id);
        instanceService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    @GetMapping("/datacenter/{datacenterId}")
    public List<InstanceDTO> getInstancesByDatacenter(@PathVariable("datacenterId") Long datacenterId) {
        LOG.debug("REST request to get Instances by Datacenter : {}", datacenterId);
        return instanceService.findByDatacenter(datacenterId);
    }
}
