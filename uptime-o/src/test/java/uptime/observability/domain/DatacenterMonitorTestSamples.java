package uptime.observability.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

public class DatacenterMonitorTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static DatacenterMonitor getDatacenterMonitorSample1() {
        return new DatacenterMonitor().id(1L);
    }

    public static DatacenterMonitor getDatacenterMonitorSample2() {
        return new DatacenterMonitor().id(2L);
    }

    public static DatacenterMonitor getDatacenterMonitorRandomSampleGenerator() {
        return new DatacenterMonitor().id(longCount.incrementAndGet());
    }
}
