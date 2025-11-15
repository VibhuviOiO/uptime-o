package uptime.observability.service.mapper;

import org.springframework.stereotype.Component;
import uptime.observability.domain.Instance;
import uptime.observability.domain.Service;
import uptime.observability.domain.ServiceInstance;
import uptime.observability.service.dto.ServiceInstanceDTO;

@Component
public class ServiceInstanceMapper {

    public ServiceInstanceDTO toDto(ServiceInstance entity) {
        if (entity == null) {
            return null;
        }
        ServiceInstanceDTO dto = new ServiceInstanceDTO();
        dto.setId(entity.getId());
        dto.setServiceId(entity.getService() != null ? entity.getService().getId() : null);
        dto.setInstanceId(entity.getInstance() != null ? entity.getInstance().getId() : null);
        dto.setInstanceName(entity.getInstance() != null ? entity.getInstance().getName() : null);
        dto.setInstanceHostname(entity.getInstance() != null ? entity.getInstance().getHostname() : null);
        dto.setPort(entity.getPort());
        dto.setIsActive(entity.getIsActive());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    public ServiceInstance toEntity(ServiceInstanceDTO dto) {
        if (dto == null) {
            return null;
        }
        ServiceInstance entity = new ServiceInstance();
        entity.setId(dto.getId());
        if (dto.getServiceId() != null) {
            Service service = new Service();
            service.setId(dto.getServiceId());
            entity.setService(service);
        }
        if (dto.getInstanceId() != null) {
            Instance instance = new Instance();
            instance.setId(dto.getInstanceId());
            entity.setInstance(instance);
        }
        entity.setPort(dto.getPort());
        entity.setIsActive(dto.getIsActive());
        return entity;
    }
}
