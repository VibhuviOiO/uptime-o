package uptime.observability.service.mapper;

import org.mapstruct.*;
import uptime.observability.domain.Agent;
import uptime.observability.domain.Datacenter;
import uptime.observability.service.dto.AgentDTO;
import uptime.observability.service.dto.DatacenterDTO;

/**
 * Mapper for the entity {@link Agent} and its DTO {@link AgentDTO}.
 */
@Mapper(componentModel = "spring")
public interface AgentMapper extends EntityMapper<AgentDTO, Agent> {
    @Mapping(target = "datacenter", source = "datacenter", qualifiedByName = "datacenterId")
    AgentDTO toDto(Agent s);

    @Named("datacenterId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    DatacenterDTO toDtoDatacenterId(Datacenter datacenter);
}
