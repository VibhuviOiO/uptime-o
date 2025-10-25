package uptime.observability.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import uptime.observability.web.rest.TestUtil;

class DatacenterMonitorDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(DatacenterMonitorDTO.class);
        DatacenterMonitorDTO datacenterMonitorDTO1 = new DatacenterMonitorDTO();
        datacenterMonitorDTO1.setId(1L);
        DatacenterMonitorDTO datacenterMonitorDTO2 = new DatacenterMonitorDTO();
        assertThat(datacenterMonitorDTO1).isNotEqualTo(datacenterMonitorDTO2);
        datacenterMonitorDTO2.setId(datacenterMonitorDTO1.getId());
        assertThat(datacenterMonitorDTO1).isEqualTo(datacenterMonitorDTO2);
        datacenterMonitorDTO2.setId(2L);
        assertThat(datacenterMonitorDTO1).isNotEqualTo(datacenterMonitorDTO2);
        datacenterMonitorDTO1.setId(null);
        assertThat(datacenterMonitorDTO1).isNotEqualTo(datacenterMonitorDTO2);
    }
}
