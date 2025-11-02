package uptime.observability.service.mapper;

import org.mapstruct.*;
import uptime.observability.domain.HttpMonitor;
import uptime.observability.domain.Schedule;
import uptime.observability.service.dto.HttpMonitorDTO;
import uptime.observability.service.dto.ScheduleDTO;

/**
 * Mapper for the entity {@link HttpMonitor} and its DTO {@link HttpMonitorDTO}.
 */
@Mapper(componentModel = "spring")
public interface HttpMonitorMapper extends EntityMapper<HttpMonitorDTO, HttpMonitor> {
    @Mapping(target = "schedule", source = "schedule", qualifiedByName = "scheduleId")
    HttpMonitorDTO toDto(HttpMonitor s);

    @Named("scheduleId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    ScheduleDTO toDtoScheduleId(Schedule schedule);
}
