package uptime.observability.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static uptime.observability.domain.HttpHeartbeatTestSamples.*;
import static uptime.observability.domain.HttpMonitorTestSamples.*;
import static uptime.observability.domain.DatacenterMonitorTestSamples.*;
import static uptime.observability.domain.ScheduleTestSamples.*;

import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;
import uptime.observability.web.rest.TestUtil;

class HttpMonitorTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(HttpMonitor.class);
        HttpMonitor apiMonitor1 = getHttpMonitorSample1();
        HttpMonitor apiMonitor2 = new HttpMonitor();
        assertThat(apiMonitor1).isNotEqualTo(apiMonitor2);

        apiMonitor2.setId(apiMonitor1.getId());
        assertThat(apiMonitor1).isEqualTo(apiMonitor2);

        apiMonitor2 = getHttpMonitorSample2();
        assertThat(apiMonitor1).isNotEqualTo(apiMonitor2);
    }

    @Test
    void apiHeartbeatTest() {
        HttpMonitor apiMonitor = getHttpMonitorRandomSampleGenerator();
        HttpHeartbeat apiHeartbeatBack = getHttpHeartbeatRandomSampleGenerator();

        apiMonitor.addHttpHeartbeat(apiHeartbeatBack);
        assertThat(apiMonitor.getHttpHeartbeats()).containsOnly(apiHeartbeatBack);
        assertThat(apiHeartbeatBack.getMonitor()).isEqualTo(apiMonitor);

        apiMonitor.removeHttpHeartbeat(apiHeartbeatBack);
        assertThat(apiMonitor.getHttpHeartbeats()).doesNotContain(apiHeartbeatBack);
        assertThat(apiHeartbeatBack.getMonitor()).isNull();

        apiMonitor.apiHeartbeats(new HashSet<>(Set.of(apiHeartbeatBack)));
        assertThat(apiMonitor.getHttpHeartbeats()).containsOnly(apiHeartbeatBack);
        assertThat(apiHeartbeatBack.getMonitor()).isEqualTo(apiMonitor);

        apiMonitor.setHttpHeartbeats(new HashSet<>());
        assertThat(apiMonitor.getHttpHeartbeats()).doesNotContain(apiHeartbeatBack);
        assertThat(apiHeartbeatBack.getMonitor()).isNull();
    }

    @Test
    void datacenterMonitorTest() {
        HttpMonitor apiMonitor = getHttpMonitorRandomSampleGenerator();
        DatacenterMonitor datacenterMonitorBack = getDatacenterMonitorRandomSampleGenerator();

        apiMonitor.addDatacenterMonitor(datacenterMonitorBack);
        assertThat(apiMonitor.getDatacenterMonitors()).containsOnly(datacenterMonitorBack);
        assertThat(datacenterMonitorBack.getMonitor()).isEqualTo(apiMonitor);

        apiMonitor.removeDatacenterMonitor(datacenterMonitorBack);
        assertThat(apiMonitor.getDatacenterMonitors()).doesNotContain(datacenterMonitorBack);
        assertThat(datacenterMonitorBack.getMonitor()).isNull();

        apiMonitor.datacenterMonitors(new HashSet<>(Set.of(datacenterMonitorBack)));
        assertThat(apiMonitor.getDatacenterMonitors()).containsOnly(datacenterMonitorBack);
        assertThat(datacenterMonitorBack.getMonitor()).isEqualTo(apiMonitor);

        apiMonitor.setDatacenterMonitors(new HashSet<>());
        assertThat(apiMonitor.getDatacenterMonitors()).doesNotContain(datacenterMonitorBack);
        assertThat(datacenterMonitorBack.getMonitor()).isNull();
    }

    @Test
    void scheduleTest() {
        HttpMonitor apiMonitor = getHttpMonitorRandomSampleGenerator();
        Schedule scheduleBack = getScheduleRandomSampleGenerator();

        apiMonitor.setSchedule(scheduleBack);
        assertThat(apiMonitor.getSchedule()).isEqualTo(scheduleBack);

        apiMonitor.schedule(null);
        assertThat(apiMonitor.getSchedule()).isNull();
    }
}
