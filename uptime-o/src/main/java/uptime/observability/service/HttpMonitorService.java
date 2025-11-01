package uptime.observability.service;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uptime.observability.domain.HttpMonitor;
import uptime.observability.repository.HttpMonitorRepository;
import uptime.observability.service.dto.HttpMonitorDTO;
import uptime.observability.service.mapper.HttpMonitorMapper;

/**
 * Service Implementation for managing {@link uptime.observability.domain.HttpMonitor}.
 */
@Service
@Transactional
public class HttpMonitorService {

    private static final Logger LOG = LoggerFactory.getLogger(HttpMonitorService.class);

    private final HttpMonitorRepository apiMonitorRepository;

    private final HttpMonitorMapper apiMonitorMapper;

    public HttpMonitorService(HttpMonitorRepository apiMonitorRepository, HttpMonitorMapper apiMonitorMapper) {
        this.apiMonitorRepository = apiMonitorRepository;
        this.apiMonitorMapper = apiMonitorMapper;
    }

    /**
     * Save a apiMonitor.
     *
     * @param apiMonitorDTO the entity to save.
     * @return the persisted entity.
     */
    public HttpMonitorDTO save(HttpMonitorDTO apiMonitorDTO) {
        LOG.debug("Request to save HttpMonitor : {}", apiMonitorDTO);
        HttpMonitor apiMonitor = apiMonitorMapper.toEntity(apiMonitorDTO);
        apiMonitor = apiMonitorRepository.save(apiMonitor);
        return apiMonitorMapper.toDto(apiMonitor);
    }

    /**
     * Update a apiMonitor.
     *
     * @param apiMonitorDTO the entity to save.
     * @return the persisted entity.
     */
    public HttpMonitorDTO update(HttpMonitorDTO apiMonitorDTO) {
        LOG.debug("Request to update HttpMonitor : {}", apiMonitorDTO);
        HttpMonitor apiMonitor = apiMonitorMapper.toEntity(apiMonitorDTO);
        apiMonitor = apiMonitorRepository.save(apiMonitor);
        return apiMonitorMapper.toDto(apiMonitor);
    }

    /**
     * Partially update a apiMonitor.
     *
     * @param apiMonitorDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<HttpMonitorDTO> partialUpdate(HttpMonitorDTO apiMonitorDTO) {
        LOG.debug("Request to partially update HttpMonitor : {}", apiMonitorDTO);

        return apiMonitorRepository
            .findById(apiMonitorDTO.getId())
            .map(existingHttpMonitor -> {
                apiMonitorMapper.partialUpdate(existingHttpMonitor, apiMonitorDTO);

                return existingHttpMonitor;
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
    public Page<HttpMonitorDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all HttpMonitors");
        return apiMonitorRepository.findAll(pageable).map(apiMonitorMapper::toDto);
    }

    /**
     * Get one apiMonitor by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<HttpMonitorDTO> findOne(Long id) {
        LOG.debug("Request to get HttpMonitor : {}", id);
        return apiMonitorRepository.findById(id).map(apiMonitorMapper::toDto);
    }

    /**
     * Delete the apiMonitor by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete HttpMonitor : {}", id);
        apiMonitorRepository.deleteById(id);
    }
}
