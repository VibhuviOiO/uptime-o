package uptime.observability.service.impl;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uptime.observability.domain.Datacenter;
import uptime.observability.repository.DatacenterRepository;
import uptime.observability.service.DatacenterService;
import uptime.observability.service.dto.DatacenterDTO;
import uptime.observability.service.mapper.DatacenterMapper;

/**
 * Service Implementation for managing {@link uptime.observability.domain.Datacenter}.
 */
@Service
@Transactional
public class DatacenterServiceImpl implements DatacenterService {

    private static final Logger LOG = LoggerFactory.getLogger(DatacenterServiceImpl.class);

    private final DatacenterRepository datacenterRepository;

    private final DatacenterMapper datacenterMapper;

    public DatacenterServiceImpl(DatacenterRepository datacenterRepository, DatacenterMapper datacenterMapper) {
        this.datacenterRepository = datacenterRepository;
        this.datacenterMapper = datacenterMapper;
    }

    @Override
    public DatacenterDTO save(DatacenterDTO datacenterDTO) {
        LOG.debug("Request to save Datacenter : {}", datacenterDTO);
        Datacenter datacenter = datacenterMapper.toEntity(datacenterDTO);
        datacenter = datacenterRepository.save(datacenter);
        return datacenterMapper.toDto(datacenter);
    }

    @Override
    public DatacenterDTO update(DatacenterDTO datacenterDTO) {
        LOG.debug("Request to update Datacenter : {}", datacenterDTO);
        Datacenter datacenter = datacenterMapper.toEntity(datacenterDTO);
        datacenter = datacenterRepository.save(datacenter);
        return datacenterMapper.toDto(datacenter);
    }

    @Override
    public Optional<DatacenterDTO> partialUpdate(DatacenterDTO datacenterDTO) {
        LOG.debug("Request to partially update Datacenter : {}", datacenterDTO);

        return datacenterRepository
            .findById(datacenterDTO.getId())
            .map(existingDatacenter -> {
                datacenterMapper.partialUpdate(existingDatacenter, datacenterDTO);

                return existingDatacenter;
            })
            .map(datacenterRepository::save)
            .map(datacenterMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DatacenterDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Datacenters");
        return datacenterRepository.findAll(pageable).map(datacenterMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<DatacenterDTO> findOne(Long id) {
        LOG.debug("Request to get Datacenter : {}", id);
        return datacenterRepository.findById(id).map(datacenterMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Datacenter : {}", id);
        datacenterRepository.deleteById(id);
    }
}
