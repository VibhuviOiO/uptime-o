package uptime.observability.web.rest;

import java.net.URI;
import java.util.List;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import uptime.observability.domain.StatusPageItem;
import uptime.observability.repository.StatusPageItemRepository;
import uptime.observability.web.rest.errors.BadRequestAlertException;

@RestController
@RequestMapping("/api")
public class StatusPageItemResource {

    private static final String ENTITY_NAME = "statusPageItem";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final StatusPageItemRepository statusPageItemRepository;

    public StatusPageItemResource(StatusPageItemRepository statusPageItemRepository) {
        this.statusPageItemRepository = statusPageItemRepository;
    }

    @PostMapping("/status-page-items")
    public ResponseEntity<StatusPageItem> createStatusPageItem(@Valid @RequestBody StatusPageItem statusPageItem) throws Exception {
        if (statusPageItem.getId() != null) {
            throw new BadRequestAlertException("A new statusPageItem cannot already have an ID", ENTITY_NAME, "idexists");
        }
        
        // Check for duplicate
        boolean exists = statusPageItemRepository.findByStatusPageIdOrderByDisplayOrder(statusPageItem.getStatusPageId())
            .stream()
            .anyMatch(item -> 
                item.getItemType().equals(statusPageItem.getItemType()) && 
                item.getItemId().equals(statusPageItem.getItemId())
            );
        
        if (exists) {
            throw new BadRequestAlertException("This item is already added to the status page", ENTITY_NAME, "itemexists");
        }
        
        StatusPageItem result = statusPageItemRepository.save(statusPageItem);
        return ResponseEntity.created(new URI("/api/status-page-items/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @GetMapping("/status-pages/{statusPageId}/items")
    public ResponseEntity<List<StatusPageItem>> getStatusPageItems(@PathVariable Long statusPageId) {
        List<StatusPageItem> items = statusPageItemRepository.findByStatusPageIdOrderByDisplayOrder(statusPageId);
        return ResponseEntity.ok(items);
    }

    @DeleteMapping("/status-page-items/{id}")
    public ResponseEntity<Void> deleteStatusPageItem(@PathVariable Long id) {
        statusPageItemRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
