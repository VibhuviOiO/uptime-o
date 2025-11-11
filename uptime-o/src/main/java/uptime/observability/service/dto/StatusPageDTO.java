package uptime.observability.service.dto;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

public class StatusPageDTO implements Serializable {

    private List<ApiStatus> apis;
    private List<String> regions;

    public static class ApiStatus implements Serializable {
        private Long monitorId;
        private String apiName;
        private Map<String, RegionHealth> regionHealth;

        public ApiStatus() {}

        public ApiStatus(Long monitorId, String apiName, Map<String, RegionHealth> regionHealth) {
            this.monitorId = monitorId;
            this.apiName = apiName;
            this.regionHealth = regionHealth;
        }

        public Long getMonitorId() {
            return monitorId;
        }

        public void setMonitorId(Long monitorId) {
            this.monitorId = monitorId;
        }

        public String getApiName() {
            return apiName;
        }

        public void setApiName(String apiName) {
            this.apiName = apiName;
        }

        public Map<String, RegionHealth> getRegionHealth() {
            return regionHealth;
        }

        public void setRegionHealth(Map<String, RegionHealth> regionHealth) {
            this.regionHealth = regionHealth;
        }
    }

    public static class RegionHealth implements Serializable {
        private String status;
        private Integer responseTimeMs;
        private java.time.Instant lastChecked;

        public RegionHealth() {}

        public RegionHealth(String status, Integer responseTimeMs) {
            this.status = status;
            this.responseTimeMs = responseTimeMs;
        }

        public RegionHealth(String status, Integer responseTimeMs, java.time.Instant lastChecked) {
            this.status = status;
            this.responseTimeMs = responseTimeMs;
            this.lastChecked = lastChecked;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Integer getResponseTimeMs() {
            return responseTimeMs;
        }

        public void setResponseTimeMs(Integer responseTimeMs) {
            this.responseTimeMs = responseTimeMs;
        }

        public java.time.Instant getLastChecked() {
            return lastChecked;
        }

        public void setLastChecked(java.time.Instant lastChecked) {
            this.lastChecked = lastChecked;
        }
    }

    public StatusPageDTO() {}

    public StatusPageDTO(List<ApiStatus> apis, List<String> regions) {
        this.apis = apis;
        this.regions = regions;
    }

    public List<ApiStatus> getApis() {
        return apis;
    }

    public void setApis(List<ApiStatus> apis) {
        this.apis = apis;
    }

    public List<String> getRegions() {
        return regions;
    }

    public void setRegions(List<String> regions) {
        this.regions = regions;
    }
}
