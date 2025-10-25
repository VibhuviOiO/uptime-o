package uptime.observability.service.mapper;

import org.mapstruct.*;
import uptime.observability.domain.Region;
import uptime.observability.service.dto.RegionDTO;

/**
 * Mapper for the entity {@link Region} and its DTO {@link RegionDTO}.
 */
@Mapper(componentModel = "spring")
public interface RegionMapper extends EntityMapper<RegionDTO, Region> {}
