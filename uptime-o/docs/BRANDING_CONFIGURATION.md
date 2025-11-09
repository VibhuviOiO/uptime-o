# Branding Configuration Guide

## Overview
A new **Branding** tab has been added to the Settings page (Configuration section) that allows you to customize the website appearance using environment variables when running the application in a container.

## Accessing Branding Settings
1. Login as an admin user
2. Navigate to **Settings** (gear icon in the navbar)
3. Under **CONFIGURATION** section, click on **Branding**

## Features
The Branding tab displays:
- ✅ Current branding configuration values
- ✅ Environment variable names and descriptions
- ✅ Example values for each setting
- ✅ Copy-to-clipboard buttons for quick access
- ✅ Docker run command examples
- ✅ Docker Compose configuration examples
- ✅ Kubernetes ConfigMap examples

## Customizable Elements

### 1. Website Title (`WEBSITE_TITLE`)
- Appears in browser tab and navbar
- Default: `UptimeO`

### 2. Header Data (`WEBSITE_HEADERDATA`)
- Banner text above navbar (e.g., environment information)
- Default: Empty

### 3. Favicon (`WEBSITE_FAVICONPATH`)
- Path to favicon inside container
- Default: `/content/images/favicon.ico`

### 4. Logo (`WEBSITE_LOGOPATH`)
- Path to logo image inside container
- Default: `/content/images/logo.png`

### 5. Logo Dimensions
- `WEBSITE_LOGOWIDTH`: Width in pixels (Default: 200)
- `WEBSITE_LOGOHEIGHT`: Height in pixels (Default: 50)

### 6. Footer Title (`WEBSITE_FOOTERTITLE`)
- Footer text at bottom of page
- Default: `Powered by UptimeO`

## Docker Deployment Examples

### Docker Run
```bash
docker run -d \
  -e WEBSITE_TITLE="My Monitoring System" \
  -e WEBSITE_HEADERDATA="Production Environment" \
  -e WEBSITE_LOGOPATH="/content/images/logo.png" \
  -e WEBSITE_FAVICONPATH="/content/images/favicon.ico" \
  -e WEBSITE_LOGOWIDTH=180 \
  -e WEBSITE_LOGOHEIGHT=45 \
  -e WEBSITE_FOOTERTITLE="© 2025 My Company" \
  -v ./custom-images:/app/content/images \
  -p 8080:8080 \
  uptime-o:latest
```

### Docker Compose
```yaml
services:
  uptime-o:
    image: uptime-o:latest
    ports:
      - "8080:8080"
    environment:
      - WEBSITE_TITLE=My Monitoring System
      - WEBSITE_HEADERDATA=Production Environment
      - WEBSITE_LOGOPATH=/content/images/logo.png
      - WEBSITE_FAVICONPATH=/content/images/favicon.ico
      - WEBSITE_LOGOWIDTH=180
      - WEBSITE_LOGOHEIGHT=45
      - WEBSITE_FOOTERTITLE=© 2025 My Company
    volumes:
      - ./custom-images:/app/content/images
```

## Using Custom Images

### Step 1: Prepare Images
```bash
mkdir -p ./custom-images
cp your-logo.png ./custom-images/logo.png
cp your-favicon.ico ./custom-images/favicon.ico
```

### Step 2: Mount Volume
Add volume mapping in your Docker command or compose file:
```
-v ./custom-images:/app/content/images
```

### Step 3: Set Environment Variables
Point to the mounted files:
```
WEBSITE_LOGOPATH=/content/images/logo.png
WEBSITE_FAVICONPATH=/content/images/favicon.ico
```

## Technical Details

### Backend
- **Java Configuration Class**: `WebsiteProperties.java`
- **REST Endpoint**: `GET /api/website-settings` (public access, no authentication required)
- **Configuration File**: `application.yml` with environment variable placeholders

### Frontend
- **Settings Tab**: `branding-tab.tsx` in Settings page
- **Service**: `website-settings.service.ts`
- **Model**: `website-settings.model.ts`
- **Integration**: Header, Footer, and Brand components automatically load and apply settings

### Files Created/Modified
1. `src/main/java/uptime/observability/config/WebsiteProperties.java` ✨ NEW
2. `src/main/java/uptime/observability/web/rest/WebsiteSettingsResource.java` ✨ NEW
3. `src/main/webapp/app/entities/branding/branding-tab.tsx` ✨ NEW
4. `src/main/webapp/app/shared/model/website-settings.model.ts` ✨ NEW
5. `src/main/webapp/app/shared/services/website-settings.service.ts` ✨ NEW
6. `src/main/webapp/app/modules/account/settings/settings.tsx` ✏️ UPDATED
7. `src/main/webapp/app/shared/layout/header/header.tsx` ✏️ UPDATED
8. `src/main/webapp/app/shared/layout/header/header-components.tsx` ✏️ UPDATED
9. `src/main/webapp/app/shared/layout/footer/footer.tsx` ✏️ UPDATED
10. `src/main/resources/config/application.yml` ✏️ UPDATED
11. `src/main/java/uptime/observability/config/SecurityConfiguration.java` ✏️ UPDATED
12. `.env.website.example` ✨ NEW (reference file)

## Notes
- All settings are loaded from environment variables at application startup
- Changes require container restart
- No database storage - all configuration via environment variables
- Settings are publicly accessible (no authentication required) for initial page load
- Branding tab is admin-only in the UI
