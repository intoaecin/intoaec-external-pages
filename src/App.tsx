import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { EnvProvider } from "@/features/components/providers/EnvProvider";
import { createAppTheme } from "@/styles/theme";
import HomeRedirect from "@/routes/HomeRedirect";
import LeadCapturePage from "@/pages/leadCapture";
import LeadCaptureSourcePage from "@/pages/leadCapture/[projectSource]";
import LeadCaptureThankYouPage from "@/pages/leadCapture/thankYou";
import LeadCaptureCustomerPortalPage from "@/pages/leadCapture/customer-portal/[leadId]";
import LeadCaptureV2Page from "@/pages/leadCaptureV2/[leadCaptureV2Id]";
import ArchitectAvailableSlotsPage from "@/pages/architectAvailableSlots";
import ArchitectProjectSlotsPage from "@/pages/architectAvailableSlots/[projectId]";
import ArchitectSlotsThankYouPage from "@/pages/architectAvailableSlots/thankYou";

const APP_FONT_FAMILY = "'Poppins', system-ui, -apple-system, sans-serif";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EnvProvider>
        <ThemeProvider theme={createAppTheme(APP_FONT_FAMILY)}>
          <CssBaseline />
          <BrowserRouter>
            <main style={{ fontFamily: APP_FONT_FAMILY }}>
              <Routes>
                <Route path="/" element={<HomeRedirect />} />
                <Route path="/leadCapture" element={<LeadCapturePage />} />
                <Route
                  path="/leadCapture/thankYou"
                  element={<LeadCaptureThankYouPage />}
                />
                <Route
                  path="/leadCapture/customer-portal/:leadId"
                  element={<LeadCaptureCustomerPortalPage />}
                />
                <Route
                  path="/leadCapture/:projectSource"
                  element={<LeadCaptureSourcePage />}
                />
                <Route
                  path="/leadCaptureV2/:leadCaptureV2Id"
                  element={<LeadCaptureV2Page />}
                />
                <Route
                  path="/architectAvailableSlots"
                  element={<ArchitectAvailableSlotsPage />}
                />
                <Route
                  path="/architectAvailableSlots/thankYou"
                  element={<ArchitectSlotsThankYouPage />}
                />
                <Route
                  path="/architectAvailableSlots/:projectId"
                  element={<ArchitectProjectSlotsPage />}
                />
                <Route path="*" element={<HomeRedirect />} />
              </Routes>
            </main>
          </BrowserRouter>
          <ToastContainer position="top-right" autoClose={4000} />
        </ThemeProvider>
      </EnvProvider>
    </QueryClientProvider>
  );
}
