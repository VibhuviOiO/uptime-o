import NotFound from "./pages/NotFound";

import { Navigate } from "react-router-dom";
import { StatusPage } from "./pages/StatusPage";

const routes = [
  { path: "/", element: <StatusPage /> },
  { path: "*", element: <NotFound /> },
];

export default routes;
