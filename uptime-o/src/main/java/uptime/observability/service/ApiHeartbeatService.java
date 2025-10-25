package uptime.observability.service;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uptime.observability.domain.ApiHeartbeat;
import uptime.observability.repository.ApiHeartbeatRepository;
import uptime.observability.service.dto.ApiHeartbeatDTO;
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
}
