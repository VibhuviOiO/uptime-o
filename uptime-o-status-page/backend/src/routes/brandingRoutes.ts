import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    navbarTitle: process.env.NAVBAR_TITLE || 'Uptime Status',
    pageTitle: process.env.STATUS_PAGE_TITLE || 'Service Status',
    pageSubtitle: process.env.STATUS_PAGE_SUBTITLE || 'Real-time monitoring dashboard',
    logoUrl: process.env.LOGO_URL || '',
    logoWidth: parseInt(process.env.LOGO_WIDTH || '220'),
    logoHeight: parseInt(process.env.LOGO_HEIGHT || '55'),
    footerText: process.env.FOOTER_TEXT || 'Powered by UptimeO',
    faviconUrl: process.env.FAVICON_URL || '/favicon.ico',
    metaDescription: process.env.META_DESCRIPTION || 'Real-time service status monitoring',
    metaKeywords: process.env.META_KEYWORDS || 'uptime, status, monitoring',
    metaAuthor: process.env.META_AUTHOR || '',
    navbarLinkText: process.env.NAVBAR_LINK_TEXT || '',
    navbarLinkUrl: process.env.NAVBAR_LINK_URL || '',
    companyName: process.env.COMPANY_NAME || '',
    companyWebsite: process.env.COMPANY_WEBSITE || '',
    supportEmail: process.env.SUPPORT_EMAIL || ''
  });
});

export default router;
