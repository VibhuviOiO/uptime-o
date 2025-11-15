package uptime.observability.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static uptime.observability.domain.AgentTestSamples.*;
import static uptime.observability.domain.DatacenterTestSamples.*;
import static uptime.observability.domain.RegionTestSamples.*;
import static uptime.observability.domain.RegionTestSamples.*;

import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;
import uptime.observability.web.rest.TestUtil;

class DatacenterTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Datacenter.class);
        Datacenter datacenter1 = getDatacenterSample1();
        Datacenter datacenter2 = new Datacenter();
        assertThat(datacenter1).isNotEqualTo(datacenter2);

        datacenter2.setId(datacenter1.getId());
        assertThat(datacenter1).isEqualTo(datacenter2);

        datacenter2 = getDatacenterSample2();
        assertThat(datacenter1).isNotEqualTo(datacenter2);
    }



    @Test
    void regionTest() {
        Datacenter datacenter = getDatacenterRandomSampleGenerator();
        Region regionBack = getRegionRandomSampleGenerator();

        datacenter.setRegion(regionBack);
        assertThat(datacenter.getRegion()).isEqualTo(regionBack);

        datacenter.region(null);
        assertThat(datacenter.getRegion()).isNull();
    }
}
