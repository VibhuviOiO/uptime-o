import NotFound from "./pages/NotFound";
import MonitoringDashboard from "./pages/MonitoringDashboard";
import MonitorDetail from "./pages/MonitorDetail";
import HTTPMonitors from "./pages/HTTPMonitors";
import TCPMonitors from "./pages/TCPMonitors";
import PINGMonitors from "./pages/PINGMonitors";
import DNSMonitors from "./pages/DNSMonitors";

import { Navigate } from "react-router-dom";
import { StatusPage } from "./pages/StatusPage";

const routes = [
  { path: "/", element: <Navigate to="/monitoring" replace /> },
  { path: "/monitoring", element: <MonitoringDashboard /> },
  { path: "/monitors", element: <HTTPMonitors /> },
  { path: "/monitors/http", element: <HTTPMonitors /> },
  { path: "/monitors/tcp", element: <TCPMonitors /> },
  { path: "/monitors/ping", element: <PINGMonitors /> },
  { path: "/monitors/dns", element: <DNSMonitors /> },
  { path: "/monitors/:id", element: <MonitorDetail /> },
  { path: "/status", element: <StatusPage /> },
  { path: "*", element: <NotFound /> },
];

export default routes;
