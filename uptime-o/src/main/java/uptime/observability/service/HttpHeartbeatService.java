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
import uptime.observability.domain.HttpHeartbeat;
import uptime.observability.domain.HttpMonitor;
import uptime.observability.repository.HttpHeartbeatRepository;
import uptime.observability.service.dto.HttpHeartbeatDTO;
import uptime.observability.service.dto.HttpMonitorAggregationDTO;
import uptime.observability.service.mapper.HttpHeartbeatMapper;

/**
 * Service Implementation for managing {@link uptime.observability.domain.HttpHeartbeat}.
 */
@Service
@Transactional
public class HttpHeartbeatService {

    private static final Logger LOG = LoggerFactory.getLogger(HttpHeartbeatService.class);

    private final HttpHeartbeatRepository apiHeartbeatRepository;

    private final HttpHeartbeatMapper apiHeartbeatMapper;

    public HttpHeartbeatService(HttpHeartbeatRepository apiHeartbeatRepository, HttpHeartbeatMapper apiHeartbeatMapper) {
        this.apiHeartbeatRepository = apiHeartbeatRepository;
        this.apiHeartbeatMapper = apiHeartbeatMapper;
    }

    /**
     * Save a apiHeartbeat.
     *
     * @param apiHeartbeatDTO the entity to save.
     * @return the persisted entity.
     */
    public HttpHeartbeatDTO save(HttpHeartbeatDTO apiHeartbeatDTO) {
        LOG.debug("Request to save ApiHeartbeat : {}", apiHeartbeatDTO);
        HttpHeartbeat apiHeartbeat = apiHeartbeatMapper.toEntity(apiHeartbeatDTO);
        apiHeartbeat = apiHeartbeatRepository.save(apiHeartbeat);
        return apiHeartbeatMapper.toDto(apiHeartbeat);
    }

    /**
     * Update a apiHeartbeat.
     *
     * @param apiHeartbeatDTO the entity to save.
     * @return the persisted entity.
     */
    public HttpHeartbeatDTO update(HttpHeartbeatDTO apiHeartbeatDTO) {
        LOG.debug("Request to update ApiHeartbeat : {}", apiHeartbeatDTO);
        HttpHeartbeat apiHeartbeat = apiHeartbeatMapper.toEntity(apiHeartbeatDTO);
        apiHeartbeat = apiHeartbeatRepository.save(apiHeartbeat);
        return apiHeartbeatMapper.toDto(apiHeartbeat);
    }

    /**
     * Partially update a apiHeartbeat.
     *
     * @param apiHeartbeatDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<HttpHeartbeatDTO> partialUpdate(HttpHeartbeatDTO apiHeartbeatDTO) {
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
    public Page<HttpHeartbeatDTO> findAll(Pageable pageable) {
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
    public Optional<HttpHeartbeatDTO> findOne(Long id) {
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
    public List<HttpMonitorAggregationDTO> getAggregatedHeartbeats(String range) {
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

        List<HttpHeartbeat> heartbeats = apiHeartbeatRepository.findByExecutedAtAfter(from);

        // Group by monitor
        Map<Long, List<HttpHeartbeat>> grouped = heartbeats.stream()
            .collect(Collectors.groupingBy(hb -> hb.getMonitor().getId()));

        return grouped.entrySet().stream().map(entry -> {
            HttpMonitor monitor = entry.getValue().get(0).getMonitor();
            long activeAgents = entry.getValue().stream().filter(HttpHeartbeat::getSuccess).map(HttpHeartbeat::getAgent).distinct().count();
            long inactiveAgents = entry.getValue().stream().filter(hb -> !Boolean.TRUE.equals(hb.getSuccess())).map(HttpHeartbeat::getAgent).distinct().count();
            HttpHeartbeat lastCheck = entry.getValue().stream().max((a, b) -> a.getExecutedAt().compareTo(b.getExecutedAt())).orElse(null);

            HttpMonitorAggregationDTO dto = new HttpMonitorAggregationDTO();
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
