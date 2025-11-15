package uptime.observability.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uptime.observability.repository.ServiceInstanceRepository;
import uptime.observability.service.dto.ServiceInstanceDTO;
import uptime.observability.service.mapper.ServiceInstanceMapper;

@Service
@Transactional
public class ServiceInstanceService {

    private static final Logger LOG = LoggerFactory.getLogger(ServiceInstanceService.class);

    private final ServiceInstanceRepository serviceInstanceRepository;
    private final ServiceInstanceMapper serviceInstanceMapper;

    public ServiceInstanceService(
        ServiceInstanceRepository serviceInstanceRepository,
        ServiceInstanceMapper serviceInstanceMapper
    ) {
        this.serviceInstanceRepository = serviceInstanceRepository;
        this.serviceInstanceMapper = serviceInstanceMapper;
    }

    public ServiceInstanceDTO save(ServiceInstanceDTO serviceInstanceDTO) {
        LOG.debug("Request to save ServiceInstance : {}", serviceInstanceDTO);
        uptime.observability.domain.ServiceInstance serviceInstance = serviceInstanceMapper.toEntity(serviceInstanceDTO);
        serviceInstance = serviceInstanceRepository.save(serviceInstance);
        return serviceInstanceMapper.toDto(serviceInstance);
    }

    @Transactional(readOnly = true)
    public List<ServiceInstanceDTO> findByServiceId(Long serviceId) {
        LOG.debug("Request to get ServiceInstances by serviceId : {}", serviceId);
        return serviceInstanceRepository
            .findByServiceId(serviceId)
            .stream()
            .map(serviceInstanceMapper::toDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<ServiceInstanceDTO> findOne(Long id) {
        LOG.debug("Request to get ServiceInstance : {}", id);
        return serviceInstanceRepository.findById(id).map(serviceInstanceMapper::toDto);
    }

    public void delete(Long id) {
        LOG.debug("Request to delete ServiceInstance : {}", id);
        serviceInstanceRepository.deleteById(id);
    }
}
