package uptime.observability.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

/**
 * A Region.
 */
@Entity
@Table(name = "regions")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Region implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(min = 1, max = 50)
    @Column(name = "name", length = 50, nullable = false)
    private String name;

    @Size(max = 20)
    @Column(name = "region_code", length = 20)
    private String regionCode;

    @Size(max = 20)
    @Column(name = "group_name", length = 20)
    private String groupName;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "region")
    @JsonIgnoreProperties(value = { "agents", "region" }, allowSetters = true)
    private Set<Datacenter> datacenters = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Region id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public Region name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRegionCode() {
        return this.regionCode;
    }

    public Region regionCode(String regionCode) {
        this.setRegionCode(regionCode);
        return this;
    }

    public void setRegionCode(String regionCode) {
        this.regionCode = regionCode;
    }

    public String getGroupName() {
        return this.groupName;
    }

    public Region groupName(String groupName) {
        this.setGroupName(groupName);
        return this;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public Set<Datacenter> getDatacenters() {
        return this.datacenters;
    }

    public void setDatacenters(Set<Datacenter> datacenters) {
        if (this.datacenters != null) {
            this.datacenters.forEach(i -> i.setRegion(null));
        }
        if (datacenters != null) {
            datacenters.forEach(i -> i.setRegion(this));
        }
        this.datacenters = datacenters;
    }

    public Region datacenters(Set<Datacenter> datacenters) {
        this.setDatacenters(datacenters);
        return this;
    }

    public Region addDatacenter(Datacenter datacenter) {
        this.datacenters.add(datacenter);
        datacenter.setRegion(this);
        return this;
    }

    public Region removeDatacenter(Datacenter datacenter) {
        this.datacenters.remove(datacenter);
        datacenter.setRegion(null);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Region)) {
            return false;
        }
        return getId() != null && getId().equals(((Region) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Region{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", regionCode='" + getRegionCode() + "'" +
            ", groupName='" + getGroupName() + "'" +
            "}";
    }
}
