package uptime.observability.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uptime.observability.domain.ApiKey;
import uptime.observability.repository.ApiKeyRepository;
import uptime.observability.service.dto.ApiKeyDTO;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service class for managing API Keys.
 */
@Service
@Transactional
public class ApiKeyService {

    private final Logger log = LoggerFactory.getLogger(ApiKeyService.class);

    private final ApiKeyRepository apiKeyRepository;
    private final PasswordEncoder passwordEncoder;

    public ApiKeyService(ApiKeyRepository apiKeyRepository, PasswordEncoder passwordEncoder) {
        this.apiKeyRepository = apiKeyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Generate a new API key
     */
    private String generateApiKey() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return "uptimeo_" + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /**
     * Create SHA-256 hash of API key for fast lookup
     */
    private String hashApiKey(String plainTextKey) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(plainTextKey.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Create a new API key
     */
    public ApiKeyDTO createApiKey(ApiKeyDTO apiKeyDTO) {
        log.debug("Request to create API Key : {}", apiKeyDTO);

        String plainTextKey = generateApiKey();
        // Store SHA-256 hash for fast O(1) lookup
        String lookupHash = hashApiKey(plainTextKey);

        ApiKey apiKey = new ApiKey();
        apiKey.setName(apiKeyDTO.getName());
        apiKey.setDescription(apiKeyDTO.getDescription());
        apiKey.setKeyHash(lookupHash);
        apiKey.setActive(true);
        apiKey.setExpiresAt(apiKeyDTO.getExpiresAt());

        apiKey = apiKeyRepository.save(apiKey);

        ApiKeyDTO result = toDto(apiKey);
        result.setPlainTextKey(plainTextKey); // Only time this is shown
        return result;
    }

    /**
     * Get all API keys
     */
    @Transactional(readOnly = true)
    public List<ApiKeyDTO> getAllApiKeys() {
        log.debug("Request to get all API Keys");
        return apiKeyRepository.findAll().stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Get one API key by ID
     */
    @Transactional(readOnly = true)
    public Optional<ApiKeyDTO> getApiKey(Long id) {
        log.debug("Request to get API Key : {}", id);
        return apiKeyRepository.findById(id).map(this::toDto);
    }

    /**
     * Deactivate an API key
     */
    public void deactivateApiKey(Long id) {
        log.debug("Request to deactivate API Key : {}", id);
        apiKeyRepository.findById(id).ifPresent(apiKey -> {
            apiKey.setActive(false);
            apiKeyRepository.save(apiKey);
        });
    }

    /**
     * Delete an API key
     */
    public void deleteApiKey(Long id) {
        log.debug("Request to delete API Key : {}", id);
        apiKeyRepository.deleteById(id);
    }

    /**
     * Validate an API key - O(1) lookup using SHA-256 hash
     */
    @Transactional(readOnly = true)
    public boolean validateApiKey(String plainTextKey) {
        if (plainTextKey == null || plainTextKey.isEmpty()) {
            return false;
        }

        // Hash the provided key
        String lookupHash = hashApiKey(plainTextKey);

        // O(1) database lookup by hash
        Optional<ApiKey> apiKeyOpt = apiKeyRepository.findByKeyHash(lookupHash);

        if (apiKeyOpt.isEmpty()) {
            log.debug("API Key not found");
            return false;
        }

        ApiKey apiKey = apiKeyOpt.get();

        // Check if key is active
        if (!apiKey.isActive()) {
            log.debug("API Key is inactive");
            return false;
        }

        // Check if key is expired
        if (apiKey.getExpiresAt() != null && apiKey.getExpiresAt().isBefore(Instant.now())) {
            log.debug("API Key has expired");
            return false;
        }

        // Update last used date (async to avoid blocking)
        updateLastUsedDate(apiKey.getId());

        log.debug("API Key validation successful for key ID: {}", apiKey.getId());
        return true;
    }

    /**
     * Update last used date asynchronously
     */
    private void updateLastUsedDate(Long apiKeyId) {
        try {
            apiKeyRepository.findById(apiKeyId).ifPresent(apiKey -> {
                apiKey.setLastUsedDate(Instant.now());
                apiKeyRepository.save(apiKey);
            });
        } catch (Exception e) {
            log.warn("Failed to update last used date for API key {}: {}", apiKeyId, e.getMessage());
        }
    }

    private ApiKeyDTO toDto(ApiKey apiKey) {
        ApiKeyDTO dto = new ApiKeyDTO();
        dto.setId(apiKey.getId());
        dto.setName(apiKey.getName());
        dto.setDescription(apiKey.getDescription());
        dto.setActive(apiKey.isActive());
        dto.setLastUsedDate(apiKey.getLastUsedDate());
        dto.setExpiresAt(apiKey.getExpiresAt());
        dto.setCreatedBy(apiKey.getCreatedBy());
        dto.setCreatedDate(apiKey.getCreatedDate());
        return dto;
    }
}
