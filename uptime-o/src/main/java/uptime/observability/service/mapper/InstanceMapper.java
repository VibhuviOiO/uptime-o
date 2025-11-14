package uptime.observability.service.mapper;

import org.springframework.stereotype.Service;
import uptime.observability.domain.Instance;
import uptime.observability.service.dto.InstanceDTO;

@Service
public class InstanceMapper {

    public InstanceDTO toDto(Instance entity) {
        if (entity == null) {
            return null;
        }

        InstanceDTO dto = new InstanceDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setHostname(entity.getHostname());
        dto.setDescription(entity.getDescription());
        dto.setInstanceType(entity.getInstanceType());
        dto.setMonitoringType(entity.getMonitoringType());
        dto.setAgentId(entity.getAgentId());
        dto.setOperatingSystem(entity.getOperatingSystem());
        dto.setPlatform(entity.getPlatform());
        dto.setPrivateIpAddress(entity.getPrivateIpAddress());
        dto.setPublicIpAddress(entity.getPublicIpAddress());
        dto.setTags(entity.getTags());
        dto.setPingEnabled(entity.getPingEnabled());
        dto.setPingInterval(entity.getPingInterval());
        dto.setPingTimeoutMs(entity.getPingTimeoutMs());
        dto.setPingRetryCount(entity.getPingRetryCount());
        dto.setHardwareMonitoringEnabled(entity.getHardwareMonitoringEnabled());
        dto.setHardwareMonitoringInterval(entity.getHardwareMonitoringInterval());
        dto.setCpuWarningThreshold(entity.getCpuWarningThreshold());
        dto.setCpuDangerThreshold(entity.getCpuDangerThreshold());
        dto.setMemoryWarningThreshold(entity.getMemoryWarningThreshold());
        dto.setMemoryDangerThreshold(entity.getMemoryDangerThreshold());
        dto.setDiskWarningThreshold(entity.getDiskWarningThreshold());
        dto.setDiskDangerThreshold(entity.getDiskDangerThreshold());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setLastPingAt(entity.getLastPingAt());
        dto.setLastHardwareCheckAt(entity.getLastHardwareCheckAt());

        if (entity.getDatacenter() != null) {
            dto.setDatacenterId(entity.getDatacenter().getId());
            dto.setDatacenterName(entity.getDatacenter().getName());
        }

        return dto;
    }

    public Instance toEntity(InstanceDTO dto) {
        if (dto == null) {
            return null;
        }

        Instance entity = new Instance();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setHostname(dto.getHostname());
        entity.setDescription(dto.getDescription());
        entity.setInstanceType(dto.getInstanceType());
        entity.setMonitoringType(dto.getMonitoringType());
        entity.setAgentId(dto.getAgentId());
        entity.setOperatingSystem(dto.getOperatingSystem());
        entity.setPlatform(dto.getPlatform());
        entity.setPrivateIpAddress(dto.getPrivateIpAddress());
        entity.setPublicIpAddress(dto.getPublicIpAddress());
        entity.setTags(dto.getTags());
        entity.setPingEnabled(dto.getPingEnabled());
        entity.setPingInterval(dto.getPingInterval());
        entity.setPingTimeoutMs(dto.getPingTimeoutMs());
        entity.setPingRetryCount(dto.getPingRetryCount());
        entity.setHardwareMonitoringEnabled(dto.getHardwareMonitoringEnabled());
        entity.setHardwareMonitoringInterval(dto.getHardwareMonitoringInterval());
        entity.setCpuWarningThreshold(dto.getCpuWarningThreshold());
        entity.setCpuDangerThreshold(dto.getCpuDangerThreshold());
        entity.setMemoryWarningThreshold(dto.getMemoryWarningThreshold());
        entity.setMemoryDangerThreshold(dto.getMemoryDangerThreshold());
        entity.setDiskWarningThreshold(dto.getDiskWarningThreshold());
        entity.setDiskDangerThreshold(dto.getDiskDangerThreshold());

        return entity;
    }
}
