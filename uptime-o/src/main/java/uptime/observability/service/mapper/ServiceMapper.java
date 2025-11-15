package uptime.observability.service.mapper;

import org.springframework.stereotype.Component;
import uptime.observability.domain.Datacenter;
import uptime.observability.domain.Service;
import uptime.observability.service.dto.ServiceDTO;

@Component
public class ServiceMapper {

    public ServiceDTO toDto(Service entity) {
        if (entity == null) {
            return null;
        }
        ServiceDTO dto = new ServiceDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setServiceType(entity.getServiceType());
        dto.setEnvironment(entity.getEnvironment());
        dto.setMonitoringEnabled(entity.getMonitoringEnabled());
        dto.setIntervalSeconds(entity.getIntervalSeconds());
        dto.setTimeoutMs(entity.getTimeoutMs());
        dto.setRetryCount(entity.getRetryCount());
        dto.setLatencyWarningMs(entity.getLatencyWarningMs());
        dto.setLatencyCriticalMs(entity.getLatencyCriticalMs());
        dto.setAdvancedConfig(entity.getAdvancedConfig());
        dto.setIsActive(entity.getIsActive());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        if (entity.getDatacenter() != null) {
            dto.setDatacenterId(entity.getDatacenter().getId());
            dto.setDatacenterName(entity.getDatacenter().getName());
        }
        return dto;
    }

    public Service toEntity(ServiceDTO dto) {
        if (dto == null) {
            return null;
        }
        Service entity = new Service();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setServiceType(dto.getServiceType());
        entity.setEnvironment(dto.getEnvironment());
        entity.setMonitoringEnabled(dto.getMonitoringEnabled());
        entity.setIntervalSeconds(dto.getIntervalSeconds());
        entity.setTimeoutMs(dto.getTimeoutMs());
        entity.setRetryCount(dto.getRetryCount());
        entity.setLatencyWarningMs(dto.getLatencyWarningMs());
        entity.setLatencyCriticalMs(dto.getLatencyCriticalMs());
        entity.setAdvancedConfig(dto.getAdvancedConfig());
        entity.setIsActive(dto.getIsActive());
        if (dto.getDatacenterId() != null) {
            Datacenter datacenter = new Datacenter();
            datacenter.setId(dto.getDatacenterId());
            entity.setDatacenter(datacenter);
        }
        return entity;
    }
}
