package uptime.observability.web.rest;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uptime.observability.service.BrandingService;
import uptime.observability.service.dto.BrandingDTO;

/**
 * REST controller for managing website settings.
 */
@RestController
@RequestMapping("/api")
public class WebsiteSettingsResource {

    private final BrandingService brandingService;
    
    @Value("${application.branding.enabled:false}")
    private boolean brandingEnabled;

    public WebsiteSettingsResource(BrandingService brandingService) {
        this.brandingService = brandingService;
    }

    /**
     * {@code GET  /website-settings} : get website settings.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body containing website settings.
     */
    @GetMapping("/website-settings")
    public ResponseEntity<Map<String, Object>> getWebsiteSettings() {
        Map<String, Object> settings = new HashMap<>();
        
        // Check if branding is enabled and get from database
        if (brandingEnabled) {
            BrandingDTO branding = brandingService.findActive().orElse(null);
            if (branding != null) {
                settings.put("title", branding.getTitle());
                settings.put("description", branding.getDescription());
                settings.put("keywords", branding.getKeywords());
                settings.put("author", branding.getAuthor());
                settings.put("faviconPath", branding.getFaviconPath());
                settings.put("logoPath", branding.getLogoPath());
                settings.put("logoWidth", branding.getLogoWidth());
                settings.put("logoHeight", branding.getLogoHeight());
                settings.put("footerTitle", branding.getFooterTitle());
                settings.put("brandingEnabled", true);
                return ResponseEntity.ok(settings);
            }
        }
        
        // Fallback to built-in defaults
        settings.put("title", "UptimeO");
        settings.put("description", "Uptime Monitoring and Observability Platform");
        settings.put("keywords", "uptime,monitoring,observability,http,heartbeat");
        settings.put("author", "UptimeO Team");
        settings.put("faviconPath", "/content/images/favicon.ico");
        settings.put("logoPath", "/content/images/logo.png");
        settings.put("logoWidth", 200);
        settings.put("logoHeight", 50);
        settings.put("footerTitle", "Powered by UptimeO");
        settings.put("brandingEnabled", brandingEnabled);
        return ResponseEntity.ok(settings);
    }
}
