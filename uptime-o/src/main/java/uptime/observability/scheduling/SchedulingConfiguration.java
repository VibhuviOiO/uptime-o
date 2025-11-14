package uptime.observability.scheduling;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
@ConditionalOnProperty(name = "scheduling.enabled", havingValue = "true", matchIfMissing = true)
public class SchedulingConfiguration {

    private static final Logger LOG = LoggerFactory.getLogger(SchedulingConfiguration.class);

    public SchedulingConfiguration() {
        LOG.info("Scheduling enabled - Instance monitoring tasks will run");
    }
}
