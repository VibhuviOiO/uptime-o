package uptime.observability.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static uptime.observability.domain.HttpMonitorTestSamples.*;
import static uptime.observability.domain.DatacenterMonitorTestSamples.*;
import static uptime.observability.domain.DatacenterTestSamples.*;

import org.junit.jupiter.api.Test;
import uptime.observability.web.rest.TestUtil;

class DatacenterMonitorTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(DatacenterMonitor.class);
        DatacenterMonitor datacenterMonitor1 = getDatacenterMonitorSample1();
        DatacenterMonitor datacenterMonitor2 = new DatacenterMonitor();
        assertThat(datacenterMonitor1).isNotEqualTo(datacenterMonitor2);

        datacenterMonitor2.setId(datacenterMonitor1.getId());
        assertThat(datacenterMonitor1).isEqualTo(datacenterMonitor2);

        datacenterMonitor2 = getDatacenterMonitorSample2();
        assertThat(datacenterMonitor1).isNotEqualTo(datacenterMonitor2);
    }

    @Test
    void datacenterTest() {
        DatacenterMonitor datacenterMonitor = getDatacenterMonitorRandomSampleGenerator();
        Datacenter datacenterBack = getDatacenterRandomSampleGenerator();

        datacenterMonitor.setDatacenter(datacenterBack);
        assertThat(datacenterMonitor.getDatacenter()).isEqualTo(datacenterBack);

        datacenterMonitor.datacenter(null);
        assertThat(datacenterMonitor.getDatacenter()).isNull();
    }

    @Test
    void monitorTest() {
        DatacenterMonitor datacenterMonitor = getDatacenterMonitorRandomSampleGenerator();
        HttpMonitor apiMonitorBack = getHttpMonitorRandomSampleGenerator();

        datacenterMonitor.setMonitor(apiMonitorBack);
        assertThat(datacenterMonitor.getMonitor()).isEqualTo(apiMonitorBack);

        datacenterMonitor.monitor(null);
        assertThat(datacenterMonitor.getMonitor()).isNull();
    }
}
