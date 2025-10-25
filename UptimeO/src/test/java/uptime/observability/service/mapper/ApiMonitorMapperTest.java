package uptime.observability.service.mapper;

import static uptime.observability.domain.ApiMonitorAsserts.*;
import static uptime.observability.domain.ApiMonitorTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ApiMonitorMapperTest {

    private ApiMonitorMapper apiMonitorMapper;

    @BeforeEach
    void setUp() {
        apiMonitorMapper = new ApiMonitorMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getApiMonitorSample1();
        var actual = apiMonitorMapper.toEntity(apiMonitorMapper.toDto(expected));
        assertApiMonitorAllPropertiesEquals(expected, actual);
    }
}
