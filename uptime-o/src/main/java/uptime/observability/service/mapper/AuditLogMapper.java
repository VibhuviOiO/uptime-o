package uptime.observability.service.mapper;

import org.mapstruct.*;
import uptime.observability.domain.AuditLog;
import uptime.observability.domain.User;
import uptime.observability.service.dto.AuditLogDTO;
import uptime.observability.service.dto.UserDTO;

/**
 * Mapper for the entity {@link AuditLog} and its DTO {@link AuditLogDTO}.
 */
@Mapper(componentModel = "spring")
public interface AuditLogMapper extends EntityMapper<AuditLogDTO, AuditLog> {
    @Mapping(target = "user", source = "user", qualifiedByName = "userId")
    AuditLogDTO toDto(AuditLog s);

    @Named("userId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    UserDTO toDtoUserId(User user);
}
