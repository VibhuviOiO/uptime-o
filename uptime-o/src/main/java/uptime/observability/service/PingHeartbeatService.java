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
import uptime.observability.domain.PingHeartbeat;
import uptime.observability.repository.PingHeartbeatRepository;
import uptime.observability.service.dto.PingHeartbeatDTO;
import uptime.observability.service.mapper.PingHeartbeatMapper;

@Service
@Transactional
public class PingHeartbeatService {

    private static final Logger LOG = LoggerFactory.getLogger(PingHeartbeatService.class);

    private final PingHeartbeatRepository pingHeartbeatRepository;
    private final PingHeartbeatMapper pingHeartbeatMapper;

    public PingHeartbeatService(PingHeartbeatRepository pingHeartbeatRepository, PingHeartbeatMapper pingHeartbeatMapper) {
        this.pingHeartbeatRepository = pingHeartbeatRepository;
        this.pingHeartbeatMapper = pingHeartbeatMapper;
    }

    public PingHeartbeatDTO save(PingHeartbeatDTO pingHeartbeatDTO) {
        LOG.debug("Request to save PingHeartbeat : {}", pingHeartbeatDTO);
        PingHeartbeat pingHeartbeat = pingHeartbeatMapper.toEntity(pingHeartbeatDTO);
        pingHeartbeat = pingHeartbeatRepository.save(pingHeartbeat);
        return pingHeartbeatMapper.toDto(pingHeartbeat);
    }

    @Transactional(readOnly = true)
    public Page<PingHeartbeatDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all PingHeartbeats");
        return pingHeartbeatRepository.findAll(pageable).map(pingHeartbeatMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<PingHeartbeatDTO> findOne(Long id) {
        LOG.debug("Request to get PingHeartbeat : {}", id);
        return pingHeartbeatRepository.findById(id).map(pingHeartbeatMapper::toDto);
    }

    @Transactional(readOnly = true)
    public List<PingHeartbeatDTO> findByInstance(Long instanceId) {
        LOG.debug("Request to get PingHeartbeats by Instance : {}", instanceId);
        return pingHeartbeatRepository
            .findByInstanceIdOrderByExecutedAtDesc(instanceId)
            .stream()
            .map(pingHeartbeatMapper::toDto)
            .collect(Collectors.toList());
    }

    public void delete(Long id) {
        LOG.debug("Request to delete PingHeartbeat : {}", id);
        pingHeartbeatRepository.deleteById(id);
    }
}
