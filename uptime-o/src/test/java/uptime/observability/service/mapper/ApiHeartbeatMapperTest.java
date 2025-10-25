package uptime.observability.service.mapper;

import static uptime.observability.domain.ApiHeartbeatAsserts.*;
import static uptime.observability.domain.ApiHeartbeatTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ApiHeartbeatMapperTest {

    private ApiHeartbeatMapper apiHeartbeatMapper;

    @BeforeEach
    void setUp() {
        apiHeartbeatMapper = new ApiHeartbeatMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getApiHeartbeatSample1();
        var actual = apiHeartbeatMapper.toEntity(apiHeartbeatMapper.toDto(expected));
        assertApiHeartbeatAllPropertiesEquals(expected, actual);
    }
}
