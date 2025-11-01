package uptime.observability.config;

import java.time.Duration;
import org.ehcache.config.builders.*;
import org.ehcache.jsr107.Eh107Configuration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.cache.JCacheManagerCustomizer;
import org.springframework.boot.info.BuildProperties;
import org.springframework.boot.info.GitProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.context.annotation.*;
import tech.jhipster.config.JHipsterProperties;
import tech.jhipster.config.cache.PrefixedKeyGenerator;

@Configuration
@EnableCaching
public class CacheConfiguration {

    private GitProperties gitProperties;
    private BuildProperties buildProperties;
    private final javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration;

    public CacheConfiguration(JHipsterProperties jHipsterProperties) {
        JHipsterProperties.Cache.Ehcache ehcache = jHipsterProperties.getCache().getEhcache();

        jcacheConfiguration = Eh107Configuration.fromEhcacheCacheConfiguration(
            CacheConfigurationBuilder.newCacheConfigurationBuilder(
                Object.class,
                Object.class,
                ResourcePoolsBuilder.heap(ehcache.getMaxEntries())
            )
                .withExpiry(ExpiryPolicyBuilder.timeToLiveExpiration(Duration.ofSeconds(ehcache.getTimeToLiveSeconds())))
                .build()
        );
    }

    @Bean
    public JCacheManagerCustomizer cacheManagerCustomizer() {
        return cm -> {
            createCache(cm, uptime.observability.repository.UserRepository.USERS_BY_LOGIN_CACHE);
            createCache(cm, uptime.observability.repository.UserRepository.USERS_BY_EMAIL_CACHE);
            createCache(cm, uptime.observability.domain.Authority.class.getName());
            createCache(cm, uptime.observability.domain.Schedule.class.getName());
            createCache(cm, uptime.observability.domain.Schedule.class.getName() + ".apiMonitors");
            createCache(cm, uptime.observability.domain.HttpMonitor.class.getName());
            createCache(cm, uptime.observability.domain.HttpMonitor.class.getName() + ".apiHeartbeats");
            createCache(cm, uptime.observability.domain.HttpMonitor.class.getName() + ".datacenterMonitors");
            createCache(cm, uptime.observability.domain.Region.class.getName());
            createCache(cm, uptime.observability.domain.Region.class.getName() + ".datacenters");
            createCache(cm, uptime.observability.domain.Datacenter.class.getName());
            createCache(cm, uptime.observability.domain.Datacenter.class.getName() + ".agents");
            createCache(cm, uptime.observability.domain.Datacenter.class.getName() + ".datacenterMonitors");
            createCache(cm, uptime.observability.domain.Agent.class.getName());
            createCache(cm, uptime.observability.domain.Agent.class.getName() + ".apiHeartbeats");
            createCache(cm, uptime.observability.domain.HttpHeartbeat.class.getName());
            createCache(cm, uptime.observability.domain.AuditLog.class.getName());
            createCache(cm, uptime.observability.domain.DatacenterMonitor.class.getName());
            // jhipster-needle-ehcache-add-entry
        };
    }

    private void createCache(javax.cache.CacheManager cm, String cacheName) {
        javax.cache.Cache<Object, Object> cache = cm.getCache(cacheName);
        if (cache != null) {
            cache.clear();
        } else {
            cm.createCache(cacheName, jcacheConfiguration);
        }
    }

    @Autowired(required = false)
    public void setGitProperties(GitProperties gitProperties) {
        this.gitProperties = gitProperties;
    }

    @Autowired(required = false)
    public void setBuildProperties(BuildProperties buildProperties) {
        this.buildProperties = buildProperties;
    }

    @Bean
    public KeyGenerator keyGenerator() {
        return new PrefixedKeyGenerator(this.gitProperties, this.buildProperties);
    }
}
