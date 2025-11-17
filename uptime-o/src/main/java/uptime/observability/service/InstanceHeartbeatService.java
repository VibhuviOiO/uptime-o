package uptime.observability.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uptime.observability.domain.InstanceHeartbeat;
import uptime.observability.repository.InstanceHeartbeatRepository;
import uptime.observability.service.dto.InstanceHeartbeatDTO;
import uptime.observability.service.mapper.InstanceHeartbeatMapper;
import uptime.observability.repository.InstanceRepository;

@Service
@Transactional
public class InstanceHeartbeatService {

    private static final Logger LOG = LoggerFactory.getLogger(InstanceHeartbeatService.class);

    private final InstanceHeartbeatRepository instanceHeartbeatRepository;
    private final InstanceHeartbeatMapper instanceHeartbeatMapper;
    private final InstanceRepository instanceRepository;

    public InstanceHeartbeatService(InstanceHeartbeatRepository instanceHeartbeatRepository, InstanceHeartbeatMapper instanceHeartbeatMapper, InstanceRepository instanceRepository) {
        this.instanceHeartbeatRepository = instanceHeartbeatRepository;
        this.instanceHeartbeatMapper = instanceHeartbeatMapper;
        this.instanceRepository = instanceRepository;
    }

    public InstanceHeartbeatDTO save(InstanceHeartbeatDTO instanceHeartbeatDTO) {
        LOG.debug("Request to save InstanceHeartbeat : {}", instanceHeartbeatDTO);
        InstanceHeartbeat instanceHeartbeat = instanceHeartbeatMapper.toEntity(instanceHeartbeatDTO);
        instanceHeartbeat = instanceHeartbeatRepository.save(instanceHeartbeat);
        return instanceHeartbeatMapper.toDto(instanceHeartbeat);
    }

    @Transactional(readOnly = true)
    public Page<InstanceHeartbeatDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all InstanceHeartbeats");
        // Override default sort to show latest first
        if (pageable.getSort().isUnsorted()) {
            pageable = org.springframework.data.domain.PageRequest.of(
                pageable.getPageNumber(), 
                pageable.getPageSize(), 
                org.springframework.data.domain.Sort.by("executedAt").descending()
            );
        }
        return instanceHeartbeatRepository.findAll(pageable).map(heartbeat -> {
            InstanceHeartbeatDTO dto = instanceHeartbeatMapper.toDto(heartbeat);
            // Populate instance details
            instanceRepository.findById(heartbeat.getInstanceId()).ifPresent(instance -> {
                dto.setInstanceName(instance.getName());
                dto.setInstanceIpAddress(instance.getPrivateIpAddress() != null ? 
                    instance.getPrivateIpAddress() : instance.getPublicIpAddress());
            });
            return dto;
        });
    }

    @Transactional(readOnly = true)
    public Optional<InstanceHeartbeatDTO> findOne(Long id) {
        LOG.debug("Request to get InstanceHeartbeat : {}", id);
        return instanceHeartbeatRepository.findById(id).map(instanceHeartbeatMapper::toDto);
    }

    @Transactional(readOnly = true)
    public List<InstanceHeartbeatDTO> findByInstance(Long instanceId) {
        LOG.debug("Request to get InstanceHeartbeats by Instance : {}", instanceId);
        return instanceHeartbeatRepository
            .findByInstanceIdOrderByExecutedAtDesc(instanceId)
            .stream()
            .map(instanceHeartbeatMapper::toDto)
            .collect(Collectors.toList());
    }

    public void delete(Long id) {
        LOG.debug("Request to delete InstanceHeartbeat : {}", id);
        instanceHeartbeatRepository.deleteById(id);
    }
}
