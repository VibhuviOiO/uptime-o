package uptime.observability.service.mapper;

import org.springframework.stereotype.Component;
import uptime.observability.domain.Service;
import uptime.observability.domain.ServiceHeartbeat;
import uptime.observability.domain.ServiceInstance;
import uptime.observability.service.dto.ServiceHeartbeatDTO;

@Component
public class ServiceHeartbeatMapper {

    public ServiceHeartbeatDTO toDto(ServiceHeartbeat entity) {
        if (entity == null) {
            return null;
        }
        ServiceHeartbeatDTO dto = new ServiceHeartbeatDTO();
        dto.setId(entity.getId());
        dto.setServiceId(entity.getService() != null ? entity.getService().getId() : null);
        dto.setServiceInstanceId(entity.getServiceInstance() != null ? entity.getServiceInstance().getId() : null);
        dto.setExecutedAt(entity.getExecutedAt());
        dto.setSuccess(entity.getSuccess());
        dto.setStatus(entity.getStatus());
        dto.setResponseTimeMs(entity.getResponseTimeMs());
        dto.setErrorMessage(entity.getErrorMessage());
        dto.setMetadata(entity.getMetadata());
        dto.setAgentId(entity.getAgentId());
        return dto;
    }

    public ServiceHeartbeat toEntity(ServiceHeartbeatDTO dto) {
        if (dto == null) {
            return null;
        }
        ServiceHeartbeat entity = new ServiceHeartbeat();
        entity.setId(dto.getId());
        if (dto.getServiceId() != null) {
            Service service = new Service();
            service.setId(dto.getServiceId());
            entity.setService(service);
        }
        if (dto.getServiceInstanceId() != null) {
            ServiceInstance serviceInstance = new ServiceInstance();
            serviceInstance.setId(dto.getServiceInstanceId());
            entity.setServiceInstance(serviceInstance);
        }
        entity.setExecutedAt(dto.getExecutedAt());
        entity.setSuccess(dto.getSuccess());
        entity.setStatus(dto.getStatus());
        entity.setResponseTimeMs(dto.getResponseTimeMs());
        entity.setErrorMessage(dto.getErrorMessage());
        entity.setMetadata(dto.getMetadata());
        entity.setAgentId(dto.getAgentId());
        return entity;
    }
}
