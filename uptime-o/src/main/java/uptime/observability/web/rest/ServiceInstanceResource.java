package uptime.observability.web.rest;

import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;
import uptime.observability.service.ServiceInstanceService;
import uptime.observability.service.dto.ServiceInstanceDTO;
import uptime.observability.web.rest.errors.BadRequestAlertException;

@RestController
@RequestMapping("/api")
public class ServiceInstanceResource {

    private static final Logger LOG = LoggerFactory.getLogger(ServiceInstanceResource.class);
    private static final String ENTITY_NAME = "serviceInstance";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ServiceInstanceService serviceInstanceService;

    public ServiceInstanceResource(ServiceInstanceService serviceInstanceService) {
        this.serviceInstanceService = serviceInstanceService;
    }

    @PostMapping("/services/{serviceId}/instances")
    public ResponseEntity<ServiceInstanceDTO> addServiceInstance(
        @PathVariable Long serviceId,
        @Valid @RequestBody ServiceInstanceDTO serviceInstanceDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to add ServiceInstance to Service : {}", serviceId);
        if (serviceInstanceDTO.getId() != null) {
            throw new BadRequestAlertException("A new serviceInstance cannot already have an ID", ENTITY_NAME, "idexists");
        }
        // Set serviceId from path parameter before validation
        serviceInstanceDTO.setServiceId(serviceId);
        serviceInstanceDTO = serviceInstanceService.save(serviceInstanceDTO);
        return ResponseEntity.created(new URI("/api/service-instances/" + serviceInstanceDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, serviceInstanceDTO.getId().toString()))
            .body(serviceInstanceDTO);
    }

    @GetMapping("/services/{serviceId}/instances")
    public ResponseEntity<List<ServiceInstanceDTO>> getServiceInstances(@PathVariable Long serviceId) {
        LOG.debug("REST request to get ServiceInstances for Service : {}", serviceId);
        List<ServiceInstanceDTO> instances = serviceInstanceService.findByServiceId(serviceId);
        return ResponseEntity.ok().body(instances);
    }

    @GetMapping("/service-instances/{id}")
    public ResponseEntity<ServiceInstanceDTO> getServiceInstance(@PathVariable Long id) {
        LOG.debug("REST request to get ServiceInstance : {}", id);
        return ResponseUtil.wrapOrNotFound(serviceInstanceService.findOne(id));
    }

    @DeleteMapping("/service-instances/{id}")
    public ResponseEntity<Void> deleteServiceInstance(@PathVariable Long id) {
        LOG.debug("REST request to delete ServiceInstance : {}", id);
        serviceInstanceService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
