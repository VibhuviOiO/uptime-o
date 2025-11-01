package uptime.observability.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class HttpHeartbeatTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static HttpHeartbeat getApiHeartbeatSample1() {
        return new HttpHeartbeat()
            .id(1L)
            .responseTimeMs(1)
            .responseSizeBytes(1)
            .responseStatusCode(1)
            .responseContentType("responseContentType1")
            .responseServer("responseServer1")
            .responseCacheStatus("responseCacheStatus1")
            .dnsLookupMs(1)
            .tcpConnectMs(1)
            .tlsHandshakeMs(1)
            .timeToFirstByteMs(1)
            .warningThresholdMs(1)
            .criticalThresholdMs(1)
            .errorType("errorType1");
    }

    public static HttpHeartbeat getApiHeartbeatSample2() {
        return new HttpHeartbeat()
            .id(2L)
            .responseTimeMs(2)
            .responseSizeBytes(2)
            .responseStatusCode(2)
            .responseContentType("responseContentType2")
            .responseServer("responseServer2")
            .responseCacheStatus("responseCacheStatus2")
            .dnsLookupMs(2)
            .tcpConnectMs(2)
            .tlsHandshakeMs(2)
            .timeToFirstByteMs(2)
            .warningThresholdMs(2)
            .criticalThresholdMs(2)
            .errorType("errorType2");
    }

    public static HttpHeartbeat getApiHeartbeatRandomSampleGenerator() {
        return new HttpHeartbeat()
            .id(longCount.incrementAndGet())
            .responseTimeMs(intCount.incrementAndGet())
            .responseSizeBytes(intCount.incrementAndGet())
            .responseStatusCode(intCount.incrementAndGet())
            .responseContentType(UUID.randomUUID().toString())
            .responseServer(UUID.randomUUID().toString())
            .responseCacheStatus(UUID.randomUUID().toString())
            .dnsLookupMs(intCount.incrementAndGet())
            .tcpConnectMs(intCount.incrementAndGet())
            .tlsHandshakeMs(intCount.incrementAndGet())
            .timeToFirstByteMs(intCount.incrementAndGet())
            .warningThresholdMs(intCount.incrementAndGet())
            .criticalThresholdMs(intCount.incrementAndGet())
            .errorType(UUID.randomUUID().toString());
    }
}
