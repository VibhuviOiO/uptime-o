import { useLocation } from "react-router-dom";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/datacenters": "Datacenters",
  "/catalog": "Catalog",
  "/service-catalog": "Service Catalog",
  "/application-catalog": "Application Catalog",
  "/applications": "Applications",
  "/applications/deployments": "Deployments",
  "/infrastructure/datacenters/enabled-services": "Enabled Services",
  "/infrastructure/datacenters/instances": "Datacenter Instances",
  "/hosts": "Hosts",
};

export function usePageTitle() {
  const { pathname } = useLocation();
  return (
    PAGE_TITLES[pathname] ||
    PAGE_TITLES["/" + pathname.split("/")[1]] ||
    ""
  );
}
