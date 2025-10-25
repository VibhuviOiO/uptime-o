package uptime.observability.service.dto;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link uptime.observability.domain.ApiMonitor} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ApiMonitorDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(min = 1, max = 100)
    private String name;

    @NotNull
    @Size(min = 1, max = 10)
    private String method;

    @NotNull
    @Size(min = 1, max = 10)
    private String type;

    @Lob
    private String url;

    private String headers;

    private String body;

    private ScheduleDTO schedule;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getHeaders() {
        return headers;
    }

    public void setHeaders(String headers) {
        this.headers = headers;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public ScheduleDTO getSchedule() {
        return schedule;
    }

    public void setSchedule(ScheduleDTO schedule) {
        this.schedule = schedule;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ApiMonitorDTO)) {
            return false;
        }

        ApiMonitorDTO apiMonitorDTO = (ApiMonitorDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, apiMonitorDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ApiMonitorDTO{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", method='" + getMethod() + "'" +
            ", type='" + getType() + "'" +
            ", url='" + getUrl() + "'" +
            ", headers='" + getHeaders() + "'" +
            ", body='" + getBody() + "'" +
            ", schedule=" + getSchedule() +
            "}";
    }
}
