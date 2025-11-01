package uptime.observability.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class HttpMonitorTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static HttpMonitor getHttpMonitorSample1() {
        return new HttpMonitor().id(1L).name("name1").method("method1").type("type1");
    }

    public static HttpMonitor getHttpMonitorSample2() {
        return new HttpMonitor().id(2L).name("name2").method("method2").type("type2");
    }

    public static HttpMonitor getHttpMonitorRandomSampleGenerator() {
        return new HttpMonitor()
            .id(longCount.incrementAndGet())
            .name(UUID.randomUUID().toString())
            .method(UUID.randomUUID().toString())
            .type(UUID.randomUUID().toString());
    }
}
