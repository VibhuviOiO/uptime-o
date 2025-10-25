package uptime.observability.service;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uptime.observability.domain.DatacenterMonitor;
import uptime.observability.repository.DatacenterMonitorRepository;
import uptime.observability.service.dto.DatacenterMonitorDTO;
import uptime.observability.service.mapper.DatacenterMonitorMapper;

/**
 * Service Implementation for managing {@link uptime.observability.domain.DatacenterMonitor}.
 */
@Service
@Transactional
public class DatacenterMonitorService {

    private static final Logger LOG = LoggerFactory.getLogger(DatacenterMonitorService.class);

    private final DatacenterMonitorRepository datacenterMonitorRepository;

    private final DatacenterMonitorMapper datacenterMonitorMapper;

    public DatacenterMonitorService(
        DatacenterMonitorRepository datacenterMonitorRepository,
        DatacenterMonitorMapper datacenterMonitorMapper
    ) {
        this.datacenterMonitorRepository = datacenterMonitorRepository;
        this.datacenterMonitorMapper = datacenterMonitorMapper;
    }

    /**
     * Save a datacenterMonitor.
     *
     * @param datacenterMonitorDTO the entity to save.
     * @return the persisted entity.
     */
    public DatacenterMonitorDTO save(DatacenterMonitorDTO datacenterMonitorDTO) {
        LOG.debug("Request to save DatacenterMonitor : {}", datacenterMonitorDTO);
        DatacenterMonitor datacenterMonitor = datacenterMonitorMapper.toEntity(datacenterMonitorDTO);
        datacenterMonitor = datacenterMonitorRepository.save(datacenterMonitor);
        return datacenterMonitorMapper.toDto(datacenterMonitor);
    }

    /**
     * Update a datacenterMonitor.
     *
     * @param datacenterMonitorDTO the entity to save.
     * @return the persisted entity.
     */
    public DatacenterMonitorDTO update(DatacenterMonitorDTO datacenterMonitorDTO) {
        LOG.debug("Request to update DatacenterMonitor : {}", datacenterMonitorDTO);
        DatacenterMonitor datacenterMonitor = datacenterMonitorMapper.toEntity(datacenterMonitorDTO);
        datacenterMonitor = datacenterMonitorRepository.save(datacenterMonitor);
        return datacenterMonitorMapper.toDto(datacenterMonitor);
    }

    /**
     * Partially update a datacenterMonitor.
     *
     * @param datacenterMonitorDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<DatacenterMonitorDTO> partialUpdate(DatacenterMonitorDTO datacenterMonitorDTO) {
        LOG.debug("Request to partially update DatacenterMonitor : {}", datacenterMonitorDTO);

        return datacenterMonitorRepository
            .findById(datacenterMonitorDTO.getId())
            .map(existingDatacenterMonitor -> {
                datacenterMonitorMapper.partialUpdate(existingDatacenterMonitor, datacenterMonitorDTO);

                return existingDatacenterMonitor;
            })
            .map(datacenterMonitorRepository::save)
            .map(datacenterMonitorMapper::toDto);
    }

    /**
     * Get all the datacenterMonitors.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<DatacenterMonitorDTO> findAll() {
        LOG.debug("Request to get all DatacenterMonitors");
        return datacenterMonitorRepository
            .findAll()
            .stream()
            .map(datacenterMonitorMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one datacenterMonitor by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<DatacenterMonitorDTO> findOne(Long id) {
        LOG.debug("Request to get DatacenterMonitor : {}", id);
        return datacenterMonitorRepository.findById(id).map(datacenterMonitorMapper::toDto);
    }

    /**
     * Delete the datacenterMonitor by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete DatacenterMonitor : {}", id);
        datacenterMonitorRepository.deleteById(id);
    }
}
