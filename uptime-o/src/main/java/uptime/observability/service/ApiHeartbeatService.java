package uptime.observability.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uptime.observability.domain.ApiHeartbeat;
import uptime.observability.domain.ApiMonitor;
import uptime.observability.repository.ApiHeartbeatRepository;
import uptime.observability.service.dto.ApiHeartbeatDTO;
import uptime.observability.service.dto.ApiMonitorAggregationDTO;
import uptime.observability.service.mapper.ApiHeartbeatMapper;

/**
 * Service Implementation for managing {@link uptime.observability.domain.ApiHeartbeat}.
 */
@Service
@Transactional
public class ApiHeartbeatService {

    private static final Logger LOG = LoggerFactory.getLogger(ApiHeartbeatService.class);

    private final ApiHeartbeatRepository apiHeartbeatRepository;

    private final ApiHeartbeatMapper apiHeartbeatMapper;

    public ApiHeartbeatService(ApiHeartbeatRepository apiHeartbeatRepository, ApiHeartbeatMapper apiHeartbeatMapper) {
        this.apiHeartbeatRepository = apiHeartbeatRepository;
        this.apiHeartbeatMapper = apiHeartbeatMapper;
    }

    /**
     * Save a apiHeartbeat.
     *
     * @param apiHeartbeatDTO the entity to save.
     * @return the persisted entity.
     */
    public ApiHeartbeatDTO save(ApiHeartbeatDTO apiHeartbeatDTO) {
        LOG.debug("Request to save ApiHeartbeat : {}", apiHeartbeatDTO);
        ApiHeartbeat apiHeartbeat = apiHeartbeatMapper.toEntity(apiHeartbeatDTO);
        apiHeartbeat = apiHeartbeatRepository.save(apiHeartbeat);
        return apiHeartbeatMapper.toDto(apiHeartbeat);
    }

    /**
     * Update a apiHeartbeat.
     *
     * @param apiHeartbeatDTO the entity to save.
     * @return the persisted entity.
     */
    public ApiHeartbeatDTO update(ApiHeartbeatDTO apiHeartbeatDTO) {
        LOG.debug("Request to update ApiHeartbeat : {}", apiHeartbeatDTO);
        ApiHeartbeat apiHeartbeat = apiHeartbeatMapper.toEntity(apiHeartbeatDTO);
        apiHeartbeat = apiHeartbeatRepository.save(apiHeartbeat);
        return apiHeartbeatMapper.toDto(apiHeartbeat);
    }

    /**
     * Partially update a apiHeartbeat.
     *
     * @param apiHeartbeatDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ApiHeartbeatDTO> partialUpdate(ApiHeartbeatDTO apiHeartbeatDTO) {
        LOG.debug("Request to partially update ApiHeartbeat : {}", apiHeartbeatDTO);

        return apiHeartbeatRepository
            .findById(apiHeartbeatDTO.getId())
            .map(existingApiHeartbeat -> {
                apiHeartbeatMapper.partialUpdate(existingApiHeartbeat, apiHeartbeatDTO);

                return existingApiHeartbeat;
            })
            .map(apiHeartbeatRepository::save)
            .map(apiHeartbeatMapper::toDto);
    }

    /**
     * Get all the apiHeartbeats.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<ApiHeartbeatDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all ApiHeartbeats");
        return apiHeartbeatRepository.findAll(pageable).map(apiHeartbeatMapper::toDto);
    }

    /**
     * Get one apiHeartbeat by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ApiHeartbeatDTO> findOne(Long id) {
        LOG.debug("Request to get ApiHeartbeat : {}", id);
        return apiHeartbeatRepository.findById(id).map(apiHeartbeatMapper::toDto);
    }

    /**
     * Delete the apiHeartbeat by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete ApiHeartbeat : {}", id);
        apiHeartbeatRepository.deleteById(id);
    }

    /**
     * Get aggregated heartbeat data grouped by monitor for a given time range.
     *
     * @param range the time range (e.g., "5min", "15min", "1hour", etc.).
     * @return the list of aggregated heartbeat data.
     */
    public List<ApiMonitorAggregationDTO> getAggregatedHeartbeats(String range) {
        Instant now = Instant.now();
        Instant from;
        switch (range) {
            case "5min": from = now.minus(5, ChronoUnit.MINUTES); break;
            case "15min": from = now.minus(15, ChronoUnit.MINUTES); break;
            case "30min": from = now.minus(30, ChronoUnit.MINUTES); break;
            case "45min": from = now.minus(45, ChronoUnit.MINUTES); break;
            case "1hour": from = now.minus(1, ChronoUnit.HOURS); break;
            case "4hour": from = now.minus(4, ChronoUnit.HOURS); break;
            case "24hour": from = now.minus(24, ChronoUnit.HOURS); break;
            default: from = now.minus(5, ChronoUnit.MINUTES);
        }

        List<ApiHeartbeat> heartbeats = apiHeartbeatRepository.findByExecutedAtAfter(from);

        // Group by monitor
        Map<Long, List<ApiHeartbeat>> grouped = heartbeats.stream()
            .collect(Collectors.groupingBy(hb -> hb.getMonitor().getId()));

        return grouped.entrySet().stream().map(entry -> {
            ApiMonitor monitor = entry.getValue().get(0).getMonitor();
            long activeAgents = entry.getValue().stream().filter(ApiHeartbeat::getSuccess).map(ApiHeartbeat::getAgent).distinct().count();
            long inactiveAgents = entry.getValue().stream().filter(hb -> !Boolean.TRUE.equals(hb.getSuccess())).map(ApiHeartbeat::getAgent).distinct().count();
            ApiHeartbeat lastCheck = entry.getValue().stream().max((a, b) -> a.getExecutedAt().compareTo(b.getExecutedAt())).orElse(null);

            ApiMonitorAggregationDTO dto = new ApiMonitorAggregationDTO();
            dto.setMonitorName(monitor.getName());
            dto.setUrl(monitor.getUrl());
            dto.setMethod(monitor.getMethod());
            dto.setType(monitor.getType());
            dto.setActiveAgentsCount(activeAgents);
            dto.setInactiveAgentsCount(inactiveAgents);
            dto.setLastCheck(lastCheck != null ? lastCheck.getExecutedAt() : null);
            dto.setLastCheckResponseTime(lastCheck != null ? lastCheck.getResponseTimeMs() : null);
            dto.setMonitorId(monitor.getId());
            return dto;
        }).collect(Collectors.toList());
    }
}
