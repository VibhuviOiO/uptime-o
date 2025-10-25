package uptime.observability.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import uptime.observability.web.rest.TestUtil;

class DatacenterDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(DatacenterDTO.class);
        DatacenterDTO datacenterDTO1 = new DatacenterDTO();
        datacenterDTO1.setId(1L);
        DatacenterDTO datacenterDTO2 = new DatacenterDTO();
        assertThat(datacenterDTO1).isNotEqualTo(datacenterDTO2);
        datacenterDTO2.setId(datacenterDTO1.getId());
        assertThat(datacenterDTO1).isEqualTo(datacenterDTO2);
        datacenterDTO2.setId(2L);
        assertThat(datacenterDTO1).isNotEqualTo(datacenterDTO2);
        datacenterDTO1.setId(null);
        assertThat(datacenterDTO1).isNotEqualTo(datacenterDTO2);
    }
}
