package uptime.observability.service.dto;

import uptime.observability.domain.enumeration.DependencyType;
import java.util.List;

public class DependencyTreeDTO {
    private String id;
    private String name;
    private DependencyType type;
    private Long itemId;
    private String status;
    private String lastChecked;
    private Integer responseTimeMs;
    private String errorMessage;
    private String metadata;
    private List<DependencyTreeDTO> children;

    public DependencyTreeDTO() {}

    public DependencyTreeDTO(String id, String name, DependencyType type, Long itemId, String status, String lastChecked, Integer responseTimeMs, String errorMessage, String metadata) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.itemId = itemId;
        this.status = status;
        this.lastChecked = lastChecked;
        this.responseTimeMs = responseTimeMs;
        this.errorMessage = errorMessage;
        this.metadata = metadata;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public DependencyType getType() {
        return type;
    }

    public void setType(DependencyType type) {
        this.type = type;
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<DependencyTreeDTO> getChildren() {
        return children;
    }

    public void setChildren(List<DependencyTreeDTO> children) {
        this.children = children;
    }

    public String getLastChecked() {
        return lastChecked;
    }

    public void setLastChecked(String lastChecked) {
        this.lastChecked = lastChecked;
    }

    public Integer getResponseTimeMs() {
        return responseTimeMs;
    }

    public void setResponseTimeMs(Integer responseTimeMs) {
        this.responseTimeMs = responseTimeMs;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }
}
