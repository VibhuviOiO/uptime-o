package uptime.observability.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class ScheduleTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static Schedule getScheduleSample1() {
        return new Schedule().id(1L).name("name1").interval(1).thresholdsWarning(1).thresholdsCritical(1);
    }

    public static Schedule getScheduleSample2() {
        return new Schedule().id(2L).name("name2").interval(2).thresholdsWarning(2).thresholdsCritical(2);
    }

    public static Schedule getScheduleRandomSampleGenerator() {
        return new Schedule()
            .id(longCount.incrementAndGet())
            .name(UUID.randomUUID().toString())
            .interval(intCount.incrementAndGet())
            .thresholdsWarning(intCount.incrementAndGet())
            .thresholdsCritical(intCount.incrementAndGet());
    }
}
