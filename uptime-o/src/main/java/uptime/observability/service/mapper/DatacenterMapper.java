package uptime.observability.service.mapper;

import org.mapstruct.*;
import uptime.observability.domain.Datacenter;
import uptime.observability.domain.Region;
import uptime.observability.service.dto.DatacenterDTO;
import uptime.observability.service.dto.RegionDTO;

/**
 * Mapper for the entity {@link Datacenter} and its DTO {@link DatacenterDTO}.
 */
@Mapper(componentModel = "spring")
public interface DatacenterMapper extends EntityMapper<DatacenterDTO, Datacenter> {
    @Mapping(target = "region", source = "region", qualifiedByName = "regionId")
    DatacenterDTO toDto(Datacenter s);

    @Named("regionId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    RegionDTO toDtoRegionId(Region region);
}
