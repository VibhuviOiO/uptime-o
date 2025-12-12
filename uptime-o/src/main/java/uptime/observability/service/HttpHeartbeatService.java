package uptime.observability.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uptime.observability.domain.HttpHeartbeat;

import uptime.observability.repository.HttpHeartbeatRepository;
import uptime.observability.service.dto.HttpHeartbeatDTO;

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
        LOG.debug("Request to save HttpHeartbeat : {}", apiHeartbeatDTO);
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
        LOG.debug("Request to update HttpHeartbeat : {}", apiHeartbeatDTO);
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
        LOG.debug("Request to partially update HttpHeartbeat : {}", apiHeartbeatDTO);

        return apiHeartbeatRepository
            .findById(apiHeartbeatDTO.getId())
            .map(existingHttpHeartbeat -> {
                apiHeartbeatMapper.partialUpdate(existingHttpHeartbeat, apiHeartbeatDTO);

                return existingHttpHeartbeat;
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
        LOG.debug("Request to get all HttpHeartbeats");
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
        LOG.debug("Request to get HttpHeartbeat : {}", id);
        return apiHeartbeatRepository.findById(id).map(apiHeartbeatMapper::toDto);
    }

    /**
     * Delete the apiHeartbeat by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete HttpHeartbeat : {}", id);
        apiHeartbeatRepository.deleteById(id);
    }


}
