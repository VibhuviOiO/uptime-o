package uptime.observability.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import uptime.observability.web.rest.TestUtil;

class ScheduleDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ScheduleDTO.class);
        ScheduleDTO scheduleDTO1 = new ScheduleDTO();
        scheduleDTO1.setId(1L);
        ScheduleDTO scheduleDTO2 = new ScheduleDTO();
        assertThat(scheduleDTO1).isNotEqualTo(scheduleDTO2);
        scheduleDTO2.setId(scheduleDTO1.getId());
        assertThat(scheduleDTO1).isEqualTo(scheduleDTO2);
        scheduleDTO2.setId(2L);
        assertThat(scheduleDTO1).isNotEqualTo(scheduleDTO2);
        scheduleDTO1.setId(null);
        assertThat(scheduleDTO1).isNotEqualTo(scheduleDTO2);
    }
}
