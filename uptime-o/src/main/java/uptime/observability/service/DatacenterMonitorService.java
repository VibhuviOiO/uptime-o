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
import uptime.observability.domain.Datacenter;
import uptime.observability.domain.HttpMonitor;
import uptime.observability.repository.DatacenterMonitorRepository;
import uptime.observability.repository.DatacenterRepository;
import uptime.observability.repository.HttpMonitorRepository;
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

    private final DatacenterRepository datacenterRepository;

    private final HttpMonitorRepository httpMonitorRepository;

    public DatacenterMonitorService(
        DatacenterMonitorRepository datacenterMonitorRepository,
        DatacenterMonitorMapper datacenterMonitorMapper,
        DatacenterRepository datacenterRepository,
        HttpMonitorRepository httpMonitorRepository
    ) {
        this.datacenterMonitorRepository = datacenterMonitorRepository;
        this.datacenterMonitorMapper = datacenterMonitorMapper;
        this.datacenterRepository = datacenterRepository;
        this.httpMonitorRepository = httpMonitorRepository;
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

        // Load the monitor and datacenter from database by their IDs
        if (datacenterMonitorDTO.getMonitor() != null && datacenterMonitorDTO.getMonitor().getId() != null) {
            Optional<HttpMonitor> monitor = httpMonitorRepository.findById(datacenterMonitorDTO.getMonitor().getId());
            if (monitor.isPresent()) {
                datacenterMonitor.setMonitor(monitor.get());
            }
        }

        if (datacenterMonitorDTO.getDatacenter() != null && datacenterMonitorDTO.getDatacenter().getId() != null) {
            Optional<Datacenter> datacenter = datacenterRepository.findById(datacenterMonitorDTO.getDatacenter().getId());
            if (datacenter.isPresent()) {
                datacenterMonitor.setDatacenter(datacenter.get());
            }
        }

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
