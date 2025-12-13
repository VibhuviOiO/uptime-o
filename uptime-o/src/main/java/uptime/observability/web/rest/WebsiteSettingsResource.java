package uptime.observability.web.rest;

import java.util.HashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uptime.observability.config.WebsiteProperties;

/**
 * REST controller for managing website settings.
 */
@RestController
@RequestMapping("/api")
public class WebsiteSettingsResource {

    private final WebsiteProperties websiteProperties;

    public WebsiteSettingsResource(WebsiteProperties websiteProperties) {
        this.websiteProperties = websiteProperties;
    }

    /**
     * {@code GET  /website-settings} : get website settings.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body containing website settings.
     */
    @GetMapping("/website-settings")
    public ResponseEntity<Map<String, Object>> getWebsiteSettings() {
        Map<String, Object> settings = new HashMap<>();
        settings.put("title", websiteProperties.getTitle());
        settings.put("description", websiteProperties.getDescription());
        settings.put("keywords", websiteProperties.getKeywords());
        settings.put("author", websiteProperties.getAuthor());
        settings.put("faviconPath", websiteProperties.getFaviconPath());
        settings.put("logoPath", websiteProperties.getLogoPath());
        settings.put("logoWidth", websiteProperties.getLogoWidth());
        settings.put("logoHeight", websiteProperties.getLogoHeight());
        settings.put("footerTitle", websiteProperties.getFooterTitle());
        return ResponseEntity.ok(settings);
    }
}