package uptime.observability.service.mapper;

import org.mapstruct.*;
import uptime.observability.domain.HttpMonitor;
import uptime.observability.domain.Datacenter;
import uptime.observability.domain.DatacenterMonitor;
import uptime.observability.service.dto.HttpMonitorDTO;
import uptime.observability.service.dto.DatacenterDTO;
import uptime.observability.service.dto.DatacenterMonitorDTO;

/**
 * Mapper for the entity {@link DatacenterMonitor} and its DTO {@link DatacenterMonitorDTO}.
 */
@Mapper(componentModel = "spring")
public interface DatacenterMonitorMapper extends EntityMapper<DatacenterMonitorDTO, DatacenterMonitor> {
    @Mapping(target = "datacenter", source = "datacenter", qualifiedByName = "datacenterId")
    @Mapping(target = "monitor", source = "monitor", qualifiedByName = "apiMonitorId")
    DatacenterMonitorDTO toDto(DatacenterMonitor s);

    @Named("datacenterId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    DatacenterDTO toDtoDatacenterId(Datacenter datacenter);

    @Named("apiMonitorId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    HttpMonitorDTO toDtoHttpMonitorId(HttpMonitor apiMonitor);
}
