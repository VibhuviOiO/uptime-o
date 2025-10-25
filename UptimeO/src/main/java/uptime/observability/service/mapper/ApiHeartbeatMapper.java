package uptime.observability.service.mapper;

import org.mapstruct.*;
import uptime.observability.domain.Agent;
import uptime.observability.domain.ApiHeartbeat;
import uptime.observability.domain.ApiMonitor;
import uptime.observability.service.dto.AgentDTO;
import uptime.observability.service.dto.ApiHeartbeatDTO;
import uptime.observability.service.dto.ApiMonitorDTO;

/**
 * Mapper for the entity {@link ApiHeartbeat} and its DTO {@link ApiHeartbeatDTO}.
 */
@Mapper(componentModel = "spring")
public interface ApiHeartbeatMapper extends EntityMapper<ApiHeartbeatDTO, ApiHeartbeat> {
    @Mapping(target = "monitor", source = "monitor", qualifiedByName = "apiMonitorId")
    @Mapping(target = "agent", source = "agent", qualifiedByName = "agentId")
    ApiHeartbeatDTO toDto(ApiHeartbeat s);

    @Named("apiMonitorId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ApiMonitorDTO toDtoApiMonitorId(ApiMonitor apiMonitor);

    @Named("agentId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    AgentDTO toDtoAgentId(Agent agent);
}
