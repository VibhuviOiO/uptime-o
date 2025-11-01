package uptime.observability.service.mapper;

import static uptime.observability.domain.HttpHeartbeatAsserts.*;
import static uptime.observability.domain.HttpHeartbeatTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class HttpHeartbeatMapperTest {

    private HttpHeartbeatMapper apiHeartbeatMapper;

    @BeforeEach
    void setUp() {
        apiHeartbeatMapper = new HttpHeartbeatMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getHttpHeartbeatSample1();
        var actual = apiHeartbeatMapper.toEntity(apiHeartbeatMapper.toDto(expected));
        assertHttpHeartbeatAllPropertiesEquals(expected, actual);
    }
}
