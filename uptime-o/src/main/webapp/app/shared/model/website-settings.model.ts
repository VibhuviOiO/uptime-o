export interface IWebsiteSettings {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  faviconPath?: string;
  logoPath?: string;
  logoWidth?: number;
  logoHeight?: number;
  footerTitle?: string;
}

export const defaultValue: Readonly<IWebsiteSettings> = {
  title: 'UptimeO',
  description: 'Uptime Monitoring and Observability Platform',
  keywords: 'uptime,monitoring,observability,http,heartbeat',
  author: 'UptimeO Team',
  faviconPath: '/content/images/favicon.ico',
  logoPath: '/content/images/logo.png',
  logoWidth: 200,
  logoHeight: 50,
  footerTitle: 'Powered by UptimeO',
};
