import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import routes from "./routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch when user comes back to tab
      refetchOnReconnect: false,   // Don't refetch when reconnecting to internet
      refetchOnMount: false,       // Don't refetch when component remounts
      staleTime: 5 * 60 * 1000,    // Consider data fresh for 5 minutes
      gcTime: 10 * 60 * 1000,      // Keep unused data in cache for 10 minutes
    },
  },
});

const router = createBrowserRouter(routes);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);
export default App;