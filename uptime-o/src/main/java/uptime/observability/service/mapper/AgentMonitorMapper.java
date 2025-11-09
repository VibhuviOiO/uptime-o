package uptime.observability.service.mapper;

import org.mapstruct.*;
import uptime.observability.domain.AgentMonitor;
import uptime.observability.service.dto.AgentMonitorDTO;

/**
 * Mapper for the entity {@link AgentMonitor} and its DTO {@link AgentMonitorDTO}.
 */
@Mapper(componentModel = "spring")
public interface AgentMonitorMapper extends EntityMapper<AgentMonitorDTO, AgentMonitor> {
    @Mapping(target = "agentId", source = "agent.id")
    @Mapping(target = "agentName", source = "agent.name")
    @Mapping(target = "monitorId", source = "monitor.id")
    @Mapping(target = "monitorName", source = "monitor.name")
    AgentMonitorDTO toDto(AgentMonitor s);

    @Mapping(target = "agent", ignore = true)
    @Mapping(target = "monitor", ignore = true)
    AgentMonitor toEntity(AgentMonitorDTO agentMonitorDTO);

    default AgentMonitor fromId(Long id) {
        if (id == null) {
            return null;
        }
        AgentMonitor agentMonitor = new AgentMonitor();
        agentMonitor.setId(id);
        return agentMonitor;
    }
}
