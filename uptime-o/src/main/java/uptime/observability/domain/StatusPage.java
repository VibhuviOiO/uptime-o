package uptime.observability.domain;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Type;

@Entity
@Table(name = "status_pages")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class StatusPage implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 200)
    @Column(name = "name", length = 200, nullable = false)
    private String name;

    @NotNull
    @Size(max = 100)
    @Column(name = "slug", length = 100, nullable = false, unique = true)
    private String slug;

    @Size(max = 500)
    @Column(name = "description", length = 500)
    private String description;

    @NotNull
    @Column(name = "is_public", nullable = false)
    private Boolean isPublic;

    @Column(name = "custom_domain")
    private String customDomain;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "theme_color")
    private String themeColor;

    @Column(name = "header_text")
    private String headerText;

    @Column(name = "footer_text")
    private String footerText;

    @Column(name = "show_response_times")
    private Boolean showResponseTimes;

    @Column(name = "show_uptime_percentage")
    private Boolean showUptimePercentage;

    @Column(name = "auto_refresh_seconds")
    private Integer autoRefreshSeconds;

    @Column(name = "monitor_selection", columnDefinition = "jsonb")
    @Type(JsonNodeType.class)
    private JsonNode monitorSelection;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "is_home_page")
    private Boolean isHomePage;

    @Column(name = "allowed_roles", columnDefinition = "jsonb")
    @Type(JsonNodeType.class)
    private JsonNode allowedRoles;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        if (isActive == null) isActive = true;
        if (isPublic == null) isPublic = false;
        if (isHomePage == null) isHomePage = false;
        if (showResponseTimes == null) showResponseTimes = true;
        if (showUptimePercentage == null) showUptimePercentage = true;
        if (autoRefreshSeconds == null) autoRefreshSeconds = 30;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public StatusPage id(Long id) { this.setId(id); return this; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public StatusPage name(String name) { this.setName(name); return this; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public StatusPage slug(String slug) { this.setSlug(slug); return this; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public StatusPage description(String description) { this.setDescription(description); return this; }

    public Boolean getIsPublic() { return isPublic; }
    public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }
    public StatusPage isPublic(Boolean isPublic) { this.setIsPublic(isPublic); return this; }

    public String getCustomDomain() { return customDomain; }
    public void setCustomDomain(String customDomain) { this.customDomain = customDomain; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getThemeColor() { return themeColor; }
    public void setThemeColor(String themeColor) { this.themeColor = themeColor; }

    public String getHeaderText() { return headerText; }
    public void setHeaderText(String headerText) { this.headerText = headerText; }

    public String getFooterText() { return footerText; }
    public void setFooterText(String footerText) { this.footerText = footerText; }

    public Boolean getShowResponseTimes() { return showResponseTimes; }
    public void setShowResponseTimes(Boolean showResponseTimes) { this.showResponseTimes = showResponseTimes; }

    public Boolean getShowUptimePercentage() { return showUptimePercentage; }
    public void setShowUptimePercentage(Boolean showUptimePercentage) { this.showUptimePercentage = showUptimePercentage; }

    public Integer getAutoRefreshSeconds() { return autoRefreshSeconds; }
    public void setAutoRefreshSeconds(Integer autoRefreshSeconds) { this.autoRefreshSeconds = autoRefreshSeconds; }

    public JsonNode getMonitorSelection() { return monitorSelection; }
    public void setMonitorSelection(JsonNode monitorSelection) { this.monitorSelection = monitorSelection; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Boolean getIsHomePage() { return isHomePage; }
    public void setIsHomePage(Boolean isHomePage) { this.isHomePage = isHomePage; }
    public StatusPage isHomePage(Boolean isHomePage) { this.setIsHomePage(isHomePage); return this; }

    public JsonNode getAllowedRoles() { return allowedRoles; }
    public void setAllowedRoles(JsonNode allowedRoles) { this.allowedRoles = allowedRoles; }
    public StatusPage allowedRoles(JsonNode allowedRoles) { this.setAllowedRoles(allowedRoles); return this; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StatusPage)) return false;
        return id != null && id.equals(((StatusPage) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "StatusPage{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", isPublic=" + getIsPublic() +
            "}";
    }
}