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

    @Named("apiMonitorId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    HttpMonitorDTO toDtoHttpMonitorId(HttpMonitor apiMonitor);

    @Named("agentId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    AgentDTO toDtoAgentId(Agent agent);
}
