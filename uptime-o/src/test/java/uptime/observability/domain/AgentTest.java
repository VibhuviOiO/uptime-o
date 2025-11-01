package uptime.observability.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static uptime.observability.domain.AgentTestSamples.*;
import static uptime.observability.domain.HttpHeartbeatTestSamples.*;
import static uptime.observability.domain.DatacenterTestSamples.*;

import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;
import uptime.observability.web.rest.TestUtil;

class AgentTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Agent.class);
        Agent agent1 = getAgentSample1();
        Agent agent2 = new Agent();
        assertThat(agent1).isNotEqualTo(agent2);

        agent2.setId(agent1.getId());
        assertThat(agent1).isEqualTo(agent2);

        agent2 = getAgentSample2();
        assertThat(agent1).isNotEqualTo(agent2);
    }

    @Test
    void apiHeartbeatTest() {
        Agent agent = getAgentRandomSampleGenerator();
        HttpHeartbeat apiHeartbeatBack = getApiHeartbeatRandomSampleGenerator();

        agent.addApiHeartbeat(apiHeartbeatBack);
        assertThat(agent.getApiHeartbeats()).containsOnly(apiHeartbeatBack);
        assertThat(apiHeartbeatBack.getAgent()).isEqualTo(agent);

        agent.removeApiHeartbeat(apiHeartbeatBack);
        assertThat(agent.getApiHeartbeats()).doesNotContain(apiHeartbeatBack);
        assertThat(apiHeartbeatBack.getAgent()).isNull();

        agent.apiHeartbeats(new HashSet<>(Set.of(apiHeartbeatBack)));
        assertThat(agent.getApiHeartbeats()).containsOnly(apiHeartbeatBack);
        assertThat(apiHeartbeatBack.getAgent()).isEqualTo(agent);

        agent.setApiHeartbeats(new HashSet<>());
        assertThat(agent.getApiHeartbeats()).doesNotContain(apiHeartbeatBack);
        assertThat(apiHeartbeatBack.getAgent()).isNull();
    }

    @Test
    void datacenterTest() {
        Agent agent = getAgentRandomSampleGenerator();
        Datacenter datacenterBack = getDatacenterRandomSampleGenerator();

        agent.setDatacenter(datacenterBack);
        assertThat(agent.getDatacenter()).isEqualTo(datacenterBack);

        agent.datacenter(null);
        assertThat(agent.getDatacenter()).isNull();
    }
}
