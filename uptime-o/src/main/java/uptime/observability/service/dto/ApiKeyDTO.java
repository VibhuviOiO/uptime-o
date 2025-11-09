package uptime.observability.service.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.time.Instant;

/**
 * A DTO for the {@link uptime.observability.domain.ApiKey} entity.
 */
public class ApiKeyDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;

    private boolean active;

    private Instant lastUsedDate;

    private Instant expiresAt;

    private String createdBy;

    private Instant createdDate;

    // This field is only populated when creating a new key (one-time view)
    private String plainTextKey;

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Instant getLastUsedDate() {
        return lastUsedDate;
    }

    public void setLastUsedDate(Instant lastUsedDate) {
        this.lastUsedDate = lastUsedDate;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }

    public String getPlainTextKey() {
        return plainTextKey;
    }

    public void setPlainTextKey(String plainTextKey) {
        this.plainTextKey = plainTextKey;
    }

    @Override
    public String toString() {
        return "ApiKeyDTO{" +
            "id=" + id +
            ", name='" + name + '\'' +
            ", description='" + description + '\'' +
            ", active=" + active +
            ", lastUsedDate=" + lastUsedDate +
            ", expiresAt=" + expiresAt +
            ", createdBy='" + createdBy + '\'' +
            ", createdDate=" + createdDate +
            '}';
    }
}
