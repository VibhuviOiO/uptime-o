package uptime.observability.service.mapper;

import static uptime.observability.domain.AgentAsserts.*;
import static uptime.observability.domain.AgentTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AgentMapperTest {

    private AgentMapper agentMapper;

    @BeforeEach
    void setUp() {
        agentMapper = new AgentMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getAgentSample1();
        var actual = agentMapper.toEntity(agentMapper.toDto(expected));
        assertAgentAllPropertiesEquals(expected, actual);
    }
}
