package uptime.observability.service.mapper;

import org.mapstruct.*;
import uptime.observability.domain.Schedule;
import uptime.observability.service.dto.ScheduleDTO;

/**
 * Mapper for the entity {@link Schedule} and its DTO {@link ScheduleDTO}.
 */
@Mapper(componentModel = "spring")
public interface ScheduleMapper extends EntityMapper<ScheduleDTO, Schedule> {}
