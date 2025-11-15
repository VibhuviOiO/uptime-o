package uptime.observability.service;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uptime.observability.repository.ServiceRepository;
import uptime.observability.service.dto.ServiceDTO;
import uptime.observability.service.mapper.ServiceMapper;

@Service
@Transactional
public class ServiceService {

    private static final Logger LOG = LoggerFactory.getLogger(ServiceService.class);

    private final ServiceRepository serviceRepository;
    private final ServiceMapper serviceMapper;

    public ServiceService(ServiceRepository serviceRepository, ServiceMapper serviceMapper) {
        this.serviceRepository = serviceRepository;
        this.serviceMapper = serviceMapper;
    }

    public ServiceDTO save(ServiceDTO serviceDTO) {
        LOG.debug("Request to save Service : {}", serviceDTO);
        uptime.observability.domain.Service service = serviceMapper.toEntity(serviceDTO);
        service = serviceRepository.save(service);
        return serviceMapper.toDto(service);
    }

    public ServiceDTO update(ServiceDTO serviceDTO) {
        LOG.debug("Request to update Service : {}", serviceDTO);
        uptime.observability.domain.Service service = serviceMapper.toEntity(serviceDTO);
        service = serviceRepository.save(service);
        return serviceMapper.toDto(service);
    }

    public Optional<ServiceDTO> partialUpdate(ServiceDTO serviceDTO) {
        LOG.debug("Request to partially update Service : {}", serviceDTO);
        return serviceRepository
            .findById(serviceDTO.getId())
            .map(existingService -> {
                if (serviceDTO.getName() != null) {
                    existingService.setName(serviceDTO.getName());
                }
                if (serviceDTO.getDescription() != null) {
                    existingService.setDescription(serviceDTO.getDescription());
                }
                if (serviceDTO.getServiceType() != null) {
                    existingService.setServiceType(serviceDTO.getServiceType());
                }
                if (serviceDTO.getEnvironment() != null) {
                    existingService.setEnvironment(serviceDTO.getEnvironment());
                }
                if (serviceDTO.getMonitoringEnabled() != null) {
                    existingService.setMonitoringEnabled(serviceDTO.getMonitoringEnabled());
                }
                if (serviceDTO.getIntervalSeconds() != null) {
                    existingService.setIntervalSeconds(serviceDTO.getIntervalSeconds());
                }
                if (serviceDTO.getTimeoutMs() != null) {
                    existingService.setTimeoutMs(serviceDTO.getTimeoutMs());
                }
                if (serviceDTO.getRetryCount() != null) {
                    existingService.setRetryCount(serviceDTO.getRetryCount());
                }
                if (serviceDTO.getLatencyWarningMs() != null) {
                    existingService.setLatencyWarningMs(serviceDTO.getLatencyWarningMs());
                }
                if (serviceDTO.getLatencyCriticalMs() != null) {
                    existingService.setLatencyCriticalMs(serviceDTO.getLatencyCriticalMs());
                }
                if (serviceDTO.getAdvancedConfig() != null) {
                    existingService.setAdvancedConfig(serviceDTO.getAdvancedConfig());
                }
                if (serviceDTO.getIsActive() != null) {
                    existingService.setIsActive(serviceDTO.getIsActive());
                }
                return existingService;
            })
            .map(serviceRepository::save)
            .map(serviceMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ServiceDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Services");
        return serviceRepository.findAll(pageable).map(serviceMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<ServiceDTO> findOne(Long id) {
        LOG.debug("Request to get Service : {}", id);
        return serviceRepository.findById(id).map(serviceMapper::toDto);
    }

    public void delete(Long id) {
        LOG.debug("Request to delete Service : {}", id);
        serviceRepository.deleteById(id);
    }
}
