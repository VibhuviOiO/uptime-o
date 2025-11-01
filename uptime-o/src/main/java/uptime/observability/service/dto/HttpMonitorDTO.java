package uptime.observability.service.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Map;
import java.util.Objects;

/**
 * A DTO for the {@link uptime.observability.domain.HttpMonitor} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class HttpMonitorDTO implements Serializable {

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

    private JsonNode headers;

    private JsonNode body;

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

    public JsonNode getHeaders() {
        return headers;
    }

    public void setHeaders(JsonNode headers) {
        this.headers = headers;
    }

    public JsonNode getBody() {
        return body;
    }

    public void setBody(JsonNode body) {
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
        if (!(o instanceof HttpMonitorDTO)) {
            return false;
        }

        HttpMonitorDTO apiMonitorDTO = (HttpMonitorDTO) o;
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
        return "HttpMonitorDTO{" +
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
