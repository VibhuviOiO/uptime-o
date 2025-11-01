package uptime.observability.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static uptime.observability.domain.AgentTestSamples.*;
import static uptime.observability.domain.HttpHeartbeatTestSamples.*;
import static uptime.observability.domain.HttpMonitorTestSamples.*;

import org.junit.jupiter.api.Test;
import uptime.observability.web.rest.TestUtil;

class HttpHeartbeatTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(HttpHeartbeat.class);
        HttpHeartbeat apiHeartbeat1 = getApiHeartbeatSample1();
        HttpHeartbeat apiHeartbeat2 = new HttpHeartbeat();
        assertThat(apiHeartbeat1).isNotEqualTo(apiHeartbeat2);

        apiHeartbeat2.setId(apiHeartbeat1.getId());
        assertThat(apiHeartbeat1).isEqualTo(apiHeartbeat2);

        apiHeartbeat2 = getApiHeartbeatSample2();
        assertThat(apiHeartbeat1).isNotEqualTo(apiHeartbeat2);
    }

    @Test
    void monitorTest() {
        HttpHeartbeat apiHeartbeat = getApiHeartbeatRandomSampleGenerator();
        HttpMonitor apiMonitorBack = getHttpMonitorRandomSampleGenerator();

        apiHeartbeat.setMonitor(apiMonitorBack);
        assertThat(apiHeartbeat.getMonitor()).isEqualTo(apiMonitorBack);

        apiHeartbeat.monitor(null);
        assertThat(apiHeartbeat.getMonitor()).isNull();
    }

    @Test
    void agentTest() {
        HttpHeartbeat apiHeartbeat = getApiHeartbeatRandomSampleGenerator();
        Agent agentBack = getAgentRandomSampleGenerator();

        apiHeartbeat.setAgent(agentBack);
        assertThat(apiHeartbeat.getAgent()).isEqualTo(agentBack);

        apiHeartbeat.agent(null);
        assertThat(apiHeartbeat.getAgent()).isNull();
    }
}
