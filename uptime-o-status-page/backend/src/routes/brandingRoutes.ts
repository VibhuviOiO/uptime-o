import { Router } from 'express';
import { getViewConfig } from '../services/viewConfigService.js';

const router = Router();

router.get('/', (req, res) => {
  const viewConfig = getViewConfig();

  res.json({
    navbarTitle: process.env.NAVBAR_TITLE || 'Uptime Status',
    pageTitle: process.env.STATUS_PAGE_TITLE || 'Service Status',
    pageSubtitle: process.env.STATUS_PAGE_SUBTITLE || 'Real-time monitoring dashboard',
    logoUrl: process.env.LOGO_URL || '',
    logoDisplayMode: process.env.LOGO_DISPLAY_MODE || 'both',
    footerText: process.env.FOOTER_TEXT || 'Powered by UptimeO',
    faviconUrl: process.env.FAVICON_URL || '/favicon.ico',
    metaDescription: process.env.META_DESCRIPTION || 'Real-time service status monitoring',
    metaKeywords: process.env.META_KEYWORDS || 'uptime, status, monitoring',
    metaAuthor: process.env.META_AUTHOR || '',
    navbarLinkText: process.env.NAVBAR_LINK_TEXT || '',
    navbarLinkUrl: process.env.NAVBAR_LINK_URL || '',
    companyName: process.env.COMPANY_NAME || '',
    companyWebsite: process.env.COMPANY_WEBSITE || '',
    supportEmail: process.env.SUPPORT_EMAIL || '',
    supportPhone: process.env.SUPPORT_PHONE || '',
    navbarBgColor: process.env.NAVBAR_BG_COLOR || '#ffffff',
    navbarTextColor: process.env.NAVBAR_TEXT_COLOR || '#202124',
    footerBgColor: process.env.FOOTER_BG_COLOR || '#ffffff',
    footerTextColor: process.env.FOOTER_TEXT_COLOR || '#5f6368',
    pageBgColor: process.env.PAGE_BG_COLOR || '#f5f5f5',
    ...viewConfig,
  });
});

export default router;
