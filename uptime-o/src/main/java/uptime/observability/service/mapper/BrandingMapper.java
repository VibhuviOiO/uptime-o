package uptime.observability.service.mapper;

import org.mapstruct.*;
import uptime.observability.domain.Branding;
import uptime.observability.service.dto.BrandingDTO;

/**
 * Mapper for the entity {@link Branding} and its DTO {@link BrandingDTO}.
 */
@Mapper(componentModel = "spring")
public interface BrandingMapper extends EntityMapper<BrandingDTO, Branding> {}