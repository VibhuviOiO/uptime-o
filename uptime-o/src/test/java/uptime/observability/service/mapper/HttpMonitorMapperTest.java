package uptime.observability.service.mapper;

import static uptime.observability.domain.HttpMonitorAsserts.*;
import static uptime.observability.domain.HttpMonitorTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class HttpMonitorMapperTest {

    private HttpMonitorMapper apiMonitorMapper;

    @BeforeEach
    void setUp() {
        apiMonitorMapper = new HttpMonitorMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getHttpMonitorSample1();
        var actual = apiMonitorMapper.toEntity(apiMonitorMapper.toDto(expected));
        assertHttpMonitorAllPropertiesEquals(expected, actual);
    }
}
