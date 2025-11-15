package uptime.observability.service.mapper;

import org.mapstruct.*;
import uptime.observability.domain.Agent;
import uptime.observability.domain.Region;
import uptime.observability.service.dto.AgentDTO;
import uptime.observability.service.dto.RegionDTO;

/**
 * Mapper for the entity {@link Agent} and its DTO {@link AgentDTO}.
 */
@Mapper(componentModel = "spring")
public interface AgentMapper extends EntityMapper<AgentDTO, Agent> {
    @Mapping(target = "region", source = "region", qualifiedByName = "regionId")
    AgentDTO toDto(Agent s);

    @Named("regionId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    RegionDTO toDtoRegionId(Region region);
}
