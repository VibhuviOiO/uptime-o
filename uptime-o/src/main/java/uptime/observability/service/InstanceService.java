package uptime.observability.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uptime.observability.domain.Datacenter;
import uptime.observability.domain.Instance;
import uptime.observability.repository.DatacenterRepository;
import uptime.observability.repository.InstanceRepository;
import uptime.observability.service.dto.InstanceDTO;
import uptime.observability.service.mapper.InstanceMapper;
import uptime.observability.web.rest.errors.BadRequestAlertException;

@Service
@Transactional
public class InstanceService {

    private static final Logger LOG = LoggerFactory.getLogger(InstanceService.class);

    private final InstanceRepository instanceRepository;
    private final DatacenterRepository datacenterRepository;
    private final InstanceMapper instanceMapper;

    public InstanceService(
        InstanceRepository instanceRepository,
        DatacenterRepository datacenterRepository,
        InstanceMapper instanceMapper
    ) {
        this.instanceRepository = instanceRepository;
        this.datacenterRepository = datacenterRepository;
        this.instanceMapper = instanceMapper;
    }

    public InstanceDTO save(InstanceDTO instanceDTO) {
        LOG.debug("Request to save Instance : {}", instanceDTO);

        Instance instance = instanceMapper.toEntity(instanceDTO);

        if (instanceDTO.getDatacenterId() != null) {
            Datacenter datacenter = datacenterRepository
                .findById(instanceDTO.getDatacenterId())
                .orElseThrow(() -> new BadRequestAlertException("Datacenter not found", "instance", "datacenternotfound"));
            instance.setDatacenter(datacenter);
        }

        instance = instanceRepository.save(instance);
        return instanceMapper.toDto(instance);
    }

    public InstanceDTO update(InstanceDTO instanceDTO) {
        LOG.debug("Request to update Instance : {}", instanceDTO);

        Instance instance = instanceRepository
            .findById(instanceDTO.getId())
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", "instance", "idnotfound"));

        instance.setName(instanceDTO.getName());
        instance.setHostname(instanceDTO.getHostname());
        instance.setDescription(instanceDTO.getDescription());
        instance.setInstanceType(instanceDTO.getInstanceType());
        instance.setMonitoringType(instanceDTO.getMonitoringType());
        instance.setAgentId(instanceDTO.getAgentId());
        instance.setOperatingSystem(instanceDTO.getOperatingSystem());
        instance.setPlatform(instanceDTO.getPlatform());
        instance.setPrivateIpAddress(instanceDTO.getPrivateIpAddress());
        instance.setPublicIpAddress(instanceDTO.getPublicIpAddress());
        instance.setTags(instanceDTO.getTags());
        instance.setPingEnabled(instanceDTO.getPingEnabled());
        instance.setPingInterval(instanceDTO.getPingInterval());
        instance.setPingTimeoutMs(instanceDTO.getPingTimeoutMs());
        instance.setPingRetryCount(instanceDTO.getPingRetryCount());
        instance.setHardwareMonitoringEnabled(instanceDTO.getHardwareMonitoringEnabled());
        instance.setHardwareMonitoringInterval(instanceDTO.getHardwareMonitoringInterval());
        instance.setCpuWarningThreshold(instanceDTO.getCpuWarningThreshold());
        instance.setCpuDangerThreshold(instanceDTO.getCpuDangerThreshold());
        instance.setMemoryWarningThreshold(instanceDTO.getMemoryWarningThreshold());
        instance.setMemoryDangerThreshold(instanceDTO.getMemoryDangerThreshold());
        instance.setDiskWarningThreshold(instanceDTO.getDiskWarningThreshold());
        instance.setDiskDangerThreshold(instanceDTO.getDiskDangerThreshold());

        if (instanceDTO.getDatacenterId() != null) {
            Datacenter datacenter = datacenterRepository
                .findById(instanceDTO.getDatacenterId())
                .orElseThrow(() -> new BadRequestAlertException("Datacenter not found", "instance", "datacenternotfound"));
            instance.setDatacenter(datacenter);
        }

        instance = instanceRepository.save(instance);
        return instanceMapper.toDto(instance);
    }

    @Transactional(readOnly = true)
    public List<InstanceDTO> findAll() {
        LOG.debug("Request to get all Instances");
        return instanceRepository.findAllWithDatacenter().stream().map(instanceMapper::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<InstanceDTO> findOne(Long id) {
        LOG.debug("Request to get Instance : {}", id);
        return instanceRepository.findOneWithDatacenter(id).map(instanceMapper::toDto);
    }

    public void delete(Long id) {
        LOG.debug("Request to delete Instance : {}", id);
        instanceRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<InstanceDTO> findByDatacenter(Long datacenterId) {
        LOG.debug("Request to get Instances by Datacenter : {}", datacenterId);
        return instanceRepository.findByDatacenterId(datacenterId).stream().map(instanceMapper::toDto).collect(Collectors.toList());
    }
}
