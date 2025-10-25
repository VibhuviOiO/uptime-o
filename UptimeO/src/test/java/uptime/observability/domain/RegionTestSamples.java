package uptime.observability.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class RegionTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Region getRegionSample1() {
        return new Region().id(1L).name("name1").regionCode("regionCode1").groupName("groupName1");
    }

    public static Region getRegionSample2() {
        return new Region().id(2L).name("name2").regionCode("regionCode2").groupName("groupName2");
    }

    public static Region getRegionRandomSampleGenerator() {
        return new Region()
            .id(longCount.incrementAndGet())
            .name(UUID.randomUUID().toString())
            .regionCode(UUID.randomUUID().toString())
            .groupName(UUID.randomUUID().toString());
    }
}
