package uptime.observability.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import com.fasterxml.jackson.databind.JsonNode;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.type.SqlTypes;
import uptime.observability.domain.enumeration.DependencyType;

/**
 * A StatusDependency.
 */
@Entity
@Table(name = "status_dependency")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class StatusDependency implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "parent_type", nullable = false)
    private DependencyType parentType;

    @NotNull
    @Column(name = "parent_id", nullable = false)
    private Long parentId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "child_type", nullable = false)
    private DependencyType childType;

    @NotNull
    @Column(name = "child_id", nullable = false)
    private Long childId;

    @Column(name = "metadata", columnDefinition = "jsonb")
    @Type(JsonNodeType.class)
    private JsonNode metadata;

    @Column(name = "status_page_id")
    private Long statusPageId;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public StatusDependency id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DependencyType getParentType() {
        return this.parentType;
    }

    public StatusDependency parentType(DependencyType parentType) {
        this.setParentType(parentType);
        return this;
    }

    public void setParentType(DependencyType parentType) {
        this.parentType = parentType;
    }

    public Long getParentId() {
        return this.parentId;
    }

    public StatusDependency parentId(Long parentId) {
        this.setParentId(parentId);
        return this;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public DependencyType getChildType() {
        return this.childType;
    }

    public StatusDependency childType(DependencyType childType) {
        this.setChildType(childType);
        return this;
    }

    public void setChildType(DependencyType childType) {
        this.childType = childType;
    }

    public Long getChildId() {
        return this.childId;
    }

    public StatusDependency childId(Long childId) {
        this.setChildId(childId);
        return this;
    }

    public void setChildId(Long childId) {
        this.childId = childId;
    }

    public JsonNode getMetadata() {
        return this.metadata;
    }

    public StatusDependency metadata(JsonNode metadata) {
        this.setMetadata(metadata);
        return this;
    }

    public void setMetadata(JsonNode metadata) {
        this.metadata = metadata;
    }

    public Long getStatusPageId() {
        return this.statusPageId;
    }

    public StatusDependency statusPageId(Long statusPageId) {
        this.setStatusPageId(statusPageId);
        return this;
    }

    public void setStatusPageId(Long statusPageId) {
        this.statusPageId = statusPageId;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public StatusDependency createdAt(Instant createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof StatusDependency)) {
            return false;
        }
        return getId() != null && getId().equals(((StatusDependency) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "StatusDependency{" +
            "id=" + getId() +
            ", parentType='" + getParentType() + "'" +
            ", parentId=" + getParentId() +
            ", childType='" + getChildType() + "'" +
            ", childId=" + getChildId() +
            ", metadata='" + getMetadata() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            "}";
    }
}