package uptime.observability.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import uptime.observability.web.rest.TestUtil;

class HttpMonitorDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(HttpMonitorDTO.class);
        HttpMonitorDTO apiMonitorDTO1 = new HttpMonitorDTO();
        apiMonitorDTO1.setId(1L);
        HttpMonitorDTO apiMonitorDTO2 = new HttpMonitorDTO();
        assertThat(apiMonitorDTO1).isNotEqualTo(apiMonitorDTO2);
        apiMonitorDTO2.setId(apiMonitorDTO1.getId());
        assertThat(apiMonitorDTO1).isEqualTo(apiMonitorDTO2);
        apiMonitorDTO2.setId(2L);
        assertThat(apiMonitorDTO1).isNotEqualTo(apiMonitorDTO2);
        apiMonitorDTO1.setId(null);
        assertThat(apiMonitorDTO1).isNotEqualTo(apiMonitorDTO2);
    }
}
