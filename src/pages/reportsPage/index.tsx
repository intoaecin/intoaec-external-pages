import ArchitectAvailabilityPreview from "@/features/components/architectAvailabilityPreview/ArchitectAvailabilityPreview";

import {
  OrganizationDetailsProvider,
  useOrganization,
} from "@/features/components/providers/OrganizationThemeProvider";
import { organiationTypes } from "@/features/constants/constant";
import { useEnv } from "@/features/hooks/useEnv";
import LeadCaptureForm from "@/features/leadCapture/leadCaptureForm";
import ReportsHome from "@/features/reportsPage/ReportsHome";
import { useEffect, useState } from "react";

const OrganizationDetailsWrapper = () => {
  // const [organizationId, setOrganizationId] = useState<string>();
  // const [organizationName, setOrganizationName] = useState<string>();
  // const [organizationData, setOrganizationData] = useState<any>();
  const {
    loading,
    organizationId,
    organizationName,
    organizationType,
  } = useOrganization();

  if (loading) {
    return <p>Loading....</p>;
  }

  return (
    <>
      <ReportsHome />
      {/* <ArchitectAvailabilityPreview /> */}
    </>
  );
};

export const Home = () => {
  return (
    <OrganizationDetailsProvider>
      <OrganizationDetailsWrapper />
    </OrganizationDetailsProvider>
  );
};

export default Home;

