package uptime.observability.service.mapper;

import org.mapstruct.*;
import uptime.observability.domain.ApiMonitor;
import uptime.observability.domain.Schedule;
import uptime.observability.service.dto.ApiMonitorDTO;
import uptime.observability.service.dto.ScheduleDTO;

/**
 * Mapper for the entity {@link ApiMonitor} and its DTO {@link ApiMonitorDTO}.
 */
@Mapper(componentModel = "spring")
public interface ApiMonitorMapper extends EntityMapper<ApiMonitorDTO, ApiMonitor> {
    @Mapping(target = "schedule", source = "schedule", qualifiedByName = "scheduleId")
    ApiMonitorDTO toDto(ApiMonitor s);

    @Named("scheduleId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ScheduleDTO toDtoScheduleId(Schedule schedule);
}
