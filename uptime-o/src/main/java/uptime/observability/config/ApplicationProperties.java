package uptime.observability.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties specific to Uptime O.
 * <p>
 * Properties are configured in the {@code application.yml} file.
 * See {@link tech.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
public class ApplicationProperties {

    private final Liquibase liquibase = new Liquibase();
    private final Encryption encryption = new Encryption();
    private final Branding branding = new Branding();
    private final Monitoring monitoring = new Monitoring();

    // jhipster-needle-application-properties-property

    public Liquibase getLiquibase() {
        return liquibase;
    }

    public Encryption getEncryption() {
        return encryption;
    }

    public Branding getBranding() {
        return branding;
    }

    public Monitoring getMonitoring() {
        return monitoring;
    }

    // jhipster-needle-application-properties-property-getter

    public static class Liquibase {

        private Boolean asyncStart = true;

        public Boolean getAsyncStart() {
            return asyncStart;
        }

        public void setAsyncStart(Boolean asyncStart) {
            this.asyncStart = asyncStart;
        }
    }

    public static class Encryption {

        private String secretKey;

        public String getSecretKey() {
            return secretKey;
        }

        public void setSecretKey(String secretKey) {
            this.secretKey = secretKey;
        }
    }

    public static class Branding {

        private Boolean enabled = false;

        public Boolean getEnabled() {
            return enabled;
        }

        public void setEnabled(Boolean enabled) {
            this.enabled = enabled;
        }
    }

    public static class Monitoring {

        public enum Mode {
            STANDALONE, AGENT_ONLY, HYBRID
        }

        private Mode mode = Mode.STANDALONE;
        private final Local local = new Local();
        private final Agents agents = new Agents();

        public Mode getMode() {
            return mode;
        }

        public void setMode(Mode mode) {
            this.mode = mode;
        }

        public Local getLocal() {
            return local;
        }

        public Agents getAgents() {
            return agents;
        }

        public static class Local {
            private Boolean enabled = true;

            public Boolean getEnabled() {
                return enabled;
            }

            public void setEnabled(Boolean enabled) {
                this.enabled = enabled;
            }
        }

        public static class Agents {
            private Boolean enabled = false;
            private Boolean multiAgent = false;

            public Boolean getEnabled() {
                return enabled;
            }

            public void setEnabled(Boolean enabled) {
                this.enabled = enabled;
            }

            public Boolean getMultiAgent() {
                return multiAgent;
            }

            public void setMultiAgent(Boolean multiAgent) {
                this.multiAgent = multiAgent;
            }
        }
    }
    // jhipster-needle-application-properties-property-class
}
