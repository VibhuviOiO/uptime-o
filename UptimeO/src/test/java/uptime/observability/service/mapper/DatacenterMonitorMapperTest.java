package uptime.observability.service.mapper;

import static uptime.observability.domain.DatacenterMonitorAsserts.*;
import static uptime.observability.domain.DatacenterMonitorTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class DatacenterMonitorMapperTest {

    private DatacenterMonitorMapper datacenterMonitorMapper;

    @BeforeEach
    void setUp() {
        datacenterMonitorMapper = new DatacenterMonitorMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getDatacenterMonitorSample1();
        var actual = datacenterMonitorMapper.toEntity(datacenterMonitorMapper.toDto(expected));
        assertDatacenterMonitorAllPropertiesEquals(expected, actual);
    }
}
