package uptime.observability.service.mapper;

import org.mapstruct.*;
import uptime.observability.domain.HttpMonitor;
import uptime.observability.service.dto.HttpMonitorDTO;

/**
 * Mapper for the entity {@link HttpMonitor} and its DTO {@link HttpMonitorDTO}.
 */
@Mapper(componentModel = "spring")
public interface HttpMonitorMapper extends EntityMapper<HttpMonitorDTO, HttpMonitor> {
    @Mapping(target = "parentId", source = "parent.id")
    HttpMonitorDTO toDto(HttpMonitor s);

    @Mapping(target = "parent", source = "parentId", qualifiedByName = "httpMonitorId")
    @Mapping(target = "children", ignore = true)
    @Mapping(target = "removeChild", ignore = true)
    HttpMonitor toEntity(HttpMonitorDTO dto);

    @Named("httpMonitorId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    HttpMonitor fromId(Long id);
}
