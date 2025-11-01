package uptime.observability.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import uptime.observability.web.rest.TestUtil;

class HttpHeartbeatDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(HttpHeartbeatDTO.class);
        HttpHeartbeatDTO apiHeartbeatDTO1 = new HttpHeartbeatDTO();
        apiHeartbeatDTO1.setId(1L);
        HttpHeartbeatDTO apiHeartbeatDTO2 = new HttpHeartbeatDTO();
        assertThat(apiHeartbeatDTO1).isNotEqualTo(apiHeartbeatDTO2);
        apiHeartbeatDTO2.setId(apiHeartbeatDTO1.getId());
        assertThat(apiHeartbeatDTO1).isEqualTo(apiHeartbeatDTO2);
        apiHeartbeatDTO2.setId(2L);
        assertThat(apiHeartbeatDTO1).isNotEqualTo(apiHeartbeatDTO2);
        apiHeartbeatDTO1.setId(null);
        assertThat(apiHeartbeatDTO1).isNotEqualTo(apiHeartbeatDTO2);
    }
}
