import PageLoader from "@/features/components/Loader/PageLoader";
import {
  OrganizationDetailsProvider,
  useOrganization,
} from "@/features/components/providers/OrganizationThemeProvider";
import { organiationTypes } from "@/features/constants/constant";
import { useEnv } from "@/features/hooks/useEnv";
import CustomLeadCapture from "@/features/CustomLeadCapture/Answer/CustomLeadCapture";
import { CreateLeadCaptureTemplateProvider } from "@/features/CustomLeadCapture/CustomLeadCaptureProvider";
import LeadCaptureForm from "@/features/leadCapture/leadCaptureForm";
import { hexToRgb } from "@/lib/helpers";
import { ThemeProvider, createTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";

const OrganizationDetailsWrapper = () => {
  // const [organizationId, setOrganizationId] = useState<string>();
  // const [organizationName, setOrganizationName] = useState<string>();
  // const [organizationData, setOrganizationData] = useState<any>();
  const {
    loading,
    organizationId,
    organizationName,
    organizationType,
    mainColor,
    textColor,
  } = useOrganization();

  if (loading) {
    return <PageLoader />;
  }

  const theme = createTheme({
    palette: {
      primary: {
        main: `rgba(${hexToRgb(mainColor)}, 0.8)`, // Red
        contrastText: textColor ?? "#FFFFFF", // White,
        light: `rgba(${hexToRgb(mainColor)}, 0.1)`,
        dark: `rgba(${hexToRgb(mainColor)}, 1)`,
      },
    },
  });

  return (
    <>
      <ThemeProvider  theme={theme}>
        <ToastContainer />
        {/* {organizationId && organizationName ? <LeadCaptureForm  /> : <></>} */}
        <CreateLeadCaptureTemplateProvider withAuth={false}>
          <CustomLeadCapture />
        </CreateLeadCaptureTemplateProvider>
      </ThemeProvider>
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
