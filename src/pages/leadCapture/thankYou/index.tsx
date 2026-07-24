import { OrganizationDetailsProvider } from "@/features/components/providers/OrganizationThemeProvider";
import LeadCaptureThankYouPage from "@/features/leadCapture/LeadCaptureThankYouPage";

export default function Home() {
  return (
    <OrganizationDetailsProvider>

      <LeadCaptureThankYouPage />
    </OrganizationDetailsProvider>
  );
}
