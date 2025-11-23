export interface IStatusPage {
  id?: number;
  name?: string;
  slug?: string;
  description?: string | null;
  isPublic?: boolean;
  isHomePage?: boolean;
  customDomain?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  headerColor?: string | null;
  headerTextColor?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export const defaultValue: Readonly<IStatusPage> = {
  isPublic: false,
  isHomePage: false,
};