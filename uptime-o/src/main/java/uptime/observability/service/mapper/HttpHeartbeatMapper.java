package uptime.observability.service.mapper;

import org.mapstruct.*;
import uptime.observability.domain.Agent;
import uptime.observability.domain.HttpHeartbeat;
import uptime.observability.domain.HttpMonitor;
import uptime.observability.service.dto.AgentDTO;
import uptime.observability.service.dto.HttpHeartbeatDTO;
import uptime.observability.service.dto.HttpMonitorDTO;

/**
 * Mapper for the entity {@link HttpHeartbeat} and its DTO {@link HttpHeartbeatDTO}.
 */
@Mapper(componentModel = "spring")
public interface HttpHeartbeatMapper extends EntityMapper<HttpHeartbeatDTO, HttpHeartbeat> {
    @Mapping(target = "monitor", source = "monitor", qualifiedByName = "apiMonitorId")
    @Mapping(target = "agent", source = "agent", qualifiedByName = "agentId")
    HttpHeartbeatDTO toDto(HttpHeartbeat s);

    HttpHeartbeat toEntity(HttpHeartbeatDTO s);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void partialUpdate(@MappingTarget HttpHeartbeat entity, HttpHeartbeatDTO dto);

    @Named("apiMonitorId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    HttpMonitorDTO toDtoHttpMonitorId(HttpMonitor apiMonitor);

    @Named("agentId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    AgentDTO toDtoAgentId(Agent agent);
}
