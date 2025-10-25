package uptime.observability.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static uptime.observability.domain.ApiMonitorTestSamples.*;
import static uptime.observability.domain.ScheduleTestSamples.*;

import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;
import uptime.observability.web.rest.TestUtil;

class ScheduleTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Schedule.class);
        Schedule schedule1 = getScheduleSample1();
        Schedule schedule2 = new Schedule();
        assertThat(schedule1).isNotEqualTo(schedule2);

        schedule2.setId(schedule1.getId());
        assertThat(schedule1).isEqualTo(schedule2);

        schedule2 = getScheduleSample2();
        assertThat(schedule1).isNotEqualTo(schedule2);
    }

    @Test
    void apiMonitorTest() {
        Schedule schedule = getScheduleRandomSampleGenerator();
        ApiMonitor apiMonitorBack = getApiMonitorRandomSampleGenerator();

        schedule.addApiMonitor(apiMonitorBack);
        assertThat(schedule.getApiMonitors()).containsOnly(apiMonitorBack);
        assertThat(apiMonitorBack.getSchedule()).isEqualTo(schedule);

        schedule.removeApiMonitor(apiMonitorBack);
        assertThat(schedule.getApiMonitors()).doesNotContain(apiMonitorBack);
        assertThat(apiMonitorBack.getSchedule()).isNull();

        schedule.apiMonitors(new HashSet<>(Set.of(apiMonitorBack)));
        assertThat(schedule.getApiMonitors()).containsOnly(apiMonitorBack);
        assertThat(apiMonitorBack.getSchedule()).isEqualTo(schedule);

        schedule.setApiMonitors(new HashSet<>());
        assertThat(schedule.getApiMonitors()).doesNotContain(apiMonitorBack);
        assertThat(apiMonitorBack.getSchedule()).isNull();
    }
}
