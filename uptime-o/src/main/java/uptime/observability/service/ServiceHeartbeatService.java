package uptime.observability.service;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uptime.observability.repository.ServiceHeartbeatRepository;
import uptime.observability.service.dto.ServiceHeartbeatDTO;
import uptime.observability.service.mapper.ServiceHeartbeatMapper;

@Service
@Transactional
public class ServiceHeartbeatService {

    private static final Logger LOG = LoggerFactory.getLogger(ServiceHeartbeatService.class);

    private final ServiceHeartbeatRepository serviceHeartbeatRepository;
    private final ServiceHeartbeatMapper serviceHeartbeatMapper;

    public ServiceHeartbeatService(
        ServiceHeartbeatRepository serviceHeartbeatRepository,
        ServiceHeartbeatMapper serviceHeartbeatMapper
    ) {
        this.serviceHeartbeatRepository = serviceHeartbeatRepository;
        this.serviceHeartbeatMapper = serviceHeartbeatMapper;
    }

    public ServiceHeartbeatDTO save(ServiceHeartbeatDTO serviceHeartbeatDTO) {
        LOG.debug("Request to save ServiceHeartbeat : {}", serviceHeartbeatDTO);
        uptime.observability.domain.ServiceHeartbeat serviceHeartbeat = serviceHeartbeatMapper.toEntity(serviceHeartbeatDTO);
        serviceHeartbeat = serviceHeartbeatRepository.save(serviceHeartbeat);
        return serviceHeartbeatMapper.toDto(serviceHeartbeat);
    }

    @Transactional(readOnly = true)
    public Page<ServiceHeartbeatDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all ServiceHeartbeats");
        // Override default sort to show latest first
        if (pageable.getSort().isUnsorted()) {
            pageable = org.springframework.data.domain.PageRequest.of(
                pageable.getPageNumber(), 
                pageable.getPageSize(), 
                org.springframework.data.domain.Sort.by("executedAt").descending()
            );
        }
        return serviceHeartbeatRepository.findAll(pageable).map(heartbeat -> {
            ServiceHeartbeatDTO dto = serviceHeartbeatMapper.toDto(heartbeat);
            // Populate service and instance details
            if (heartbeat.getService() != null) {
                dto.setServiceName(heartbeat.getService().getName());
            }
            if (heartbeat.getServiceInstance() != null) {
                dto.setInstanceName(heartbeat.getServiceInstance().getInstanceName());
                dto.setInstancePort(heartbeat.getServiceInstance().getPort());
            }
            return dto;
        });
    }

    @Transactional(readOnly = true)
    public Optional<ServiceHeartbeatDTO> findOne(Long id) {
        LOG.debug("Request to get ServiceHeartbeat : {}", id);
        return serviceHeartbeatRepository.findById(id).map(serviceHeartbeatMapper::toDto);
    }
}
