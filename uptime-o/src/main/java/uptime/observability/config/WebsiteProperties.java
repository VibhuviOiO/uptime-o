package uptime.observability.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Properties for website customization.
 * These properties can be configured via environment variables or application.yml
 */
@Configuration
@ConfigurationProperties(prefix = "website")
public class WebsiteProperties {

    private String title = "UptimeO";
    private String description = "Uptime Monitoring and Observability Platform";
    private String keywords = "uptime,monitoring,observability,http,heartbeat";
    private String author = "UptimeO Team";
    private String faviconPath = "/content/images/favicon.ico";
    private String logoPath = "/content/images/logo.png";
    private Integer logoWidth = 200;
    private Integer logoHeight = 50;
    private String footerTitle = "Powered by UptimeO";

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getKeywords() {
        return keywords;
    }

    public void setKeywords(String keywords) {
        this.keywords = keywords;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getFaviconPath() {
        return faviconPath;
    }

    public void setFaviconPath(String faviconPath) {
        this.faviconPath = faviconPath;
    }

    public String getLogoPath() {
        return logoPath;
    }

    public void setLogoPath(String logoPath) {
        this.logoPath = logoPath;
    }

    public Integer getLogoWidth() {
        return logoWidth;
    }

    public void setLogoWidth(Integer logoWidth) {
        this.logoWidth = logoWidth;
    }

    public Integer getLogoHeight() {
        return logoHeight;
    }

    public void setLogoHeight(Integer logoHeight) {
        this.logoHeight = logoHeight;
    }

    public String getFooterTitle() {
        return footerTitle;
    }

    public void setFooterTitle(String footerTitle) {
        this.footerTitle = footerTitle;
    }
}
