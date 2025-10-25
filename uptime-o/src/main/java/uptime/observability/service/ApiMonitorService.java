package uptime.observability.service;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uptime.observability.domain.ApiMonitor;
import uptime.observability.repository.ApiMonitorRepository;
import uptime.observability.service.dto.ApiMonitorDTO;
import uptime.observability.service.mapper.ApiMonitorMapper;

/**
 * Service Implementation for managing {@link uptime.observability.domain.ApiMonitor}.
 */
@Service
@Transactional
public class ApiMonitorService {

    private static final Logger LOG = LoggerFactory.getLogger(ApiMonitorService.class);

    private final ApiMonitorRepository apiMonitorRepository;

    private final ApiMonitorMapper apiMonitorMapper;

    public ApiMonitorService(ApiMonitorRepository apiMonitorRepository, ApiMonitorMapper apiMonitorMapper) {
        this.apiMonitorRepository = apiMonitorRepository;
        this.apiMonitorMapper = apiMonitorMapper;
    }

    /**
     * Save a apiMonitor.
     *
     * @param apiMonitorDTO the entity to save.
     * @return the persisted entity.
     */
    public ApiMonitorDTO save(ApiMonitorDTO apiMonitorDTO) {
        LOG.debug("Request to save ApiMonitor : {}", apiMonitorDTO);
        ApiMonitor apiMonitor = apiMonitorMapper.toEntity(apiMonitorDTO);
        apiMonitor = apiMonitorRepository.save(apiMonitor);
        return apiMonitorMapper.toDto(apiMonitor);
    }

    /**
     * Update a apiMonitor.
     *
     * @param apiMonitorDTO the entity to save.
     * @return the persisted entity.
     */
    public ApiMonitorDTO update(ApiMonitorDTO apiMonitorDTO) {
        LOG.debug("Request to update ApiMonitor : {}", apiMonitorDTO);
        ApiMonitor apiMonitor = apiMonitorMapper.toEntity(apiMonitorDTO);
        apiMonitor = apiMonitorRepository.save(apiMonitor);
        return apiMonitorMapper.toDto(apiMonitor);
    }

    /**
     * Partially update a apiMonitor.
     *
     * @param apiMonitorDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ApiMonitorDTO> partialUpdate(ApiMonitorDTO apiMonitorDTO) {
        LOG.debug("Request to partially update ApiMonitor : {}", apiMonitorDTO);

        return apiMonitorRepository
            .findById(apiMonitorDTO.getId())
            .map(existingApiMonitor -> {
                apiMonitorMapper.partialUpdate(existingApiMonitor, apiMonitorDTO);

                return existingApiMonitor;
            })
            .map(apiMonitorRepository::save)
            .map(apiMonitorMapper::toDto);
    }

    /**
     * Get all the apiMonitors.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<ApiMonitorDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all ApiMonitors");
        return apiMonitorRepository.findAll(pageable).map(apiMonitorMapper::toDto);
    }

    /**
     * Get one apiMonitor by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ApiMonitorDTO> findOne(Long id) {
        LOG.debug("Request to get ApiMonitor : {}", id);
        return apiMonitorRepository.findById(id).map(apiMonitorMapper::toDto);
    }

    /**
     * Delete the apiMonitor by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete ApiMonitor : {}", id);
        apiMonitorRepository.deleteById(id);
    }
}
