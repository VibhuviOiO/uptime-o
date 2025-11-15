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
        return serviceHeartbeatRepository.findAll(pageable).map(serviceHeartbeatMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<ServiceHeartbeatDTO> findOne(Long id) {
        LOG.debug("Request to get ServiceHeartbeat : {}", id);
        return serviceHeartbeatRepository.findById(id).map(serviceHeartbeatMapper::toDto);
    }
}
