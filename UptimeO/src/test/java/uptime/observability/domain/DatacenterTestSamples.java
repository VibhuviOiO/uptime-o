package uptime.observability.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class DatacenterTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Datacenter getDatacenterSample1() {
        return new Datacenter().id(1L).code("code1").name("name1");
    }

    public static Datacenter getDatacenterSample2() {
        return new Datacenter().id(2L).code("code2").name("name2");
    }

    public static Datacenter getDatacenterRandomSampleGenerator() {
        return new Datacenter().id(longCount.incrementAndGet()).code(UUID.randomUUID().toString()).name(UUID.randomUUID().toString());
    }
}
