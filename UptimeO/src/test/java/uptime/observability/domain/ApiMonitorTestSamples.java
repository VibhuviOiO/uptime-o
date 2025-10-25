package uptime.observability.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class ApiMonitorTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static ApiMonitor getApiMonitorSample1() {
        return new ApiMonitor().id(1L).name("name1").method("method1").type("type1");
    }

    public static ApiMonitor getApiMonitorSample2() {
        return new ApiMonitor().id(2L).name("name2").method("method2").type("type2");
    }

    public static ApiMonitor getApiMonitorRandomSampleGenerator() {
        return new ApiMonitor()
            .id(longCount.incrementAndGet())
            .name(UUID.randomUUID().toString())
            .method(UUID.randomUUID().toString())
            .type(UUID.randomUUID().toString());
    }
}
