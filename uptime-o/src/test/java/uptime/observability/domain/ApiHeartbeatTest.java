package uptime.observability.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static uptime.observability.domain.AgentTestSamples.*;
import static uptime.observability.domain.ApiHeartbeatTestSamples.*;
import static uptime.observability.domain.ApiMonitorTestSamples.*;

import org.junit.jupiter.api.Test;
import uptime.observability.web.rest.TestUtil;

class ApiHeartbeatTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ApiHeartbeat.class);
        ApiHeartbeat apiHeartbeat1 = getApiHeartbeatSample1();
        ApiHeartbeat apiHeartbeat2 = new ApiHeartbeat();
        assertThat(apiHeartbeat1).isNotEqualTo(apiHeartbeat2);

        apiHeartbeat2.setId(apiHeartbeat1.getId());
        assertThat(apiHeartbeat1).isEqualTo(apiHeartbeat2);

        apiHeartbeat2 = getApiHeartbeatSample2();
        assertThat(apiHeartbeat1).isNotEqualTo(apiHeartbeat2);
    }

    @Test
    void monitorTest() {
        ApiHeartbeat apiHeartbeat = getApiHeartbeatRandomSampleGenerator();
        ApiMonitor apiMonitorBack = getApiMonitorRandomSampleGenerator();

        apiHeartbeat.setMonitor(apiMonitorBack);
        assertThat(apiHeartbeat.getMonitor()).isEqualTo(apiMonitorBack);

        apiHeartbeat.monitor(null);
        assertThat(apiHeartbeat.getMonitor()).isNull();
    }

    @Test
    void agentTest() {
        ApiHeartbeat apiHeartbeat = getApiHeartbeatRandomSampleGenerator();
        Agent agentBack = getAgentRandomSampleGenerator();

        apiHeartbeat.setAgent(agentBack);
        assertThat(apiHeartbeat.getAgent()).isEqualTo(agentBack);

        apiHeartbeat.agent(null);
        assertThat(apiHeartbeat.getAgent()).isNull();
    }
}
