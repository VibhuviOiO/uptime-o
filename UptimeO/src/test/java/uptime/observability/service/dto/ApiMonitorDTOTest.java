package uptime.observability.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import uptime.observability.web.rest.TestUtil;

class ApiMonitorDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ApiMonitorDTO.class);
        ApiMonitorDTO apiMonitorDTO1 = new ApiMonitorDTO();
        apiMonitorDTO1.setId(1L);
        ApiMonitorDTO apiMonitorDTO2 = new ApiMonitorDTO();
        assertThat(apiMonitorDTO1).isNotEqualTo(apiMonitorDTO2);
        apiMonitorDTO2.setId(apiMonitorDTO1.getId());
        assertThat(apiMonitorDTO1).isEqualTo(apiMonitorDTO2);
        apiMonitorDTO2.setId(2L);
        assertThat(apiMonitorDTO1).isNotEqualTo(apiMonitorDTO2);
        apiMonitorDTO1.setId(null);
        assertThat(apiMonitorDTO1).isNotEqualTo(apiMonitorDTO2);
    }
}
