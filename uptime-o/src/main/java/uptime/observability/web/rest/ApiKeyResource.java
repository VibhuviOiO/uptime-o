package uptime.observability.web.rest;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import uptime.observability.security.AuthoritiesConstants;
import uptime.observability.service.ApiKeyService;
import uptime.observability.service.dto.ApiKeyDTO;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

/**
 * REST controller for managing API Keys.
 */
@RestController
@RequestMapping("/api/admin")
public class ApiKeyResource {

    private final Logger log = LoggerFactory.getLogger(ApiKeyResource.class);

    private final ApiKeyService apiKeyService;

    public ApiKeyResource(ApiKeyService apiKeyService) {
        this.apiKeyService = apiKeyService;
    }

    /**
     * POST  /api-keys : Create a new API key.
     */
    @PostMapping("/api-keys")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<ApiKeyDTO> createApiKey(@Valid @RequestBody ApiKeyDTO apiKeyDTO) throws URISyntaxException {
        log.debug("REST request to create API Key : {}", apiKeyDTO);
        
        if (apiKeyDTO.getId() != null) {
            return ResponseEntity.badRequest().build();
        }
        
        ApiKeyDTO result = apiKeyService.createApiKey(apiKeyDTO);
        return ResponseEntity.created(new URI("/api/admin/api-keys/" + result.getId())).body(result);
    }

    /**
     * GET  /api-keys : Get all API keys.
     */
    @GetMapping("/api-keys")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<List<ApiKeyDTO>> getAllApiKeys() {
        log.debug("REST request to get all API Keys");
        List<ApiKeyDTO> apiKeys = apiKeyService.getAllApiKeys();
        return ResponseEntity.ok().body(apiKeys);
    }

    /**
     * GET  /api-keys/:id : Get the "id" API key.
     */
    @GetMapping("/api-keys/{id}")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<ApiKeyDTO> getApiKey(@PathVariable Long id) {
        log.debug("REST request to get API Key : {}", id);
        return apiKeyService.getApiKey(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * PUT  /api-keys/:id/deactivate : Deactivate an API key.
     */
    @PutMapping("/api-keys/{id}/deactivate")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<Void> deactivateApiKey(@PathVariable Long id) {
        log.debug("REST request to deactivate API Key : {}", id);
        apiKeyService.deactivateApiKey(id);
        return ResponseEntity.ok().build();
    }

    /**
     * DELETE  /api-keys/:id : Delete the "id" API key.
     */
    @DeleteMapping("/api-keys/{id}")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<Void> deleteApiKey(@PathVariable Long id) {
        log.debug("REST request to delete API Key : {}", id);
        apiKeyService.deleteApiKey(id);
        return ResponseEntity.noContent().build();
    }
}
