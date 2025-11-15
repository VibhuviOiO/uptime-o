package uptime.observability.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "service_instances")
public class ServiceInstance implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "port", nullable = false)
    private Integer port;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    @JsonIgnoreProperties(value = { "serviceInstances" }, allowSetters = true)
    private Service service;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instance_id", nullable = false)
    @JsonIgnoreProperties(value = { "datacenter" }, allowSetters = true)
    private Instance instance;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ServiceInstance id(Long id) {
        this.setId(id);
        return this;
    }

    public Integer getPort(){
        return port;
    }

    public void setPort(Integer port) {
        this.port = port;
    }

    public ServiceInstance port(Integer port) {
        this.setPort(port);
        return this;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public ServiceInstance isActive(Boolean isActive) {
        this.setIsActive(isActive);
        return this;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public ServiceInstance createdAt(Instant createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public ServiceInstance updatedAt(Instant updatedAt) {
        this.setUpdatedAt(updatedAt);
        return this;
    }

    public Service getService() {
        return service;
    }

    public void setService(Service service) {
        this.service = service;
    }

    public ServiceInstance service(Service service) {
        this.setService(service);
        return this;
    }

    public Instance getInstance() {
        return instance;
    }

    public void setInstance(Instance instance) {
        this.instance = instance;
    }

    public ServiceInstance instance(Instance instance) {
        this.setInstance(instance);
        return this;
    }

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        if (isActive == null) {
            isActive = true;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ServiceInstance)) return false;
        return id != null && id.equals(((ServiceInstance) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "ServiceInstance{" +
            "id=" + getId() +
            ", port=" + getPort() +
            "}";
    }
}
