import ArchitectAvailabilityPreview from "@/features/components/architectAvailabilityPreview/ArchitectAvailabilityPreview";
import PageLoader from "@/features/components/Loader/PageLoader";
import {
  OrganizationDetailsProvider,
  useOrganization,
} from "@/features/components/providers/OrganizationThemeProvider";
import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";
import { hexToRgb } from "@/lib/helpers";
import { createAppTheme } from "@/styles/theme";
import { ThemeProvider, createTheme } from "@mui/material";

const OrganizationDetailsWrapper = () => {
  const {
    loading,
    organizationId,
    organizationType,
    mainColor,
    textColor,
  } = useOrganization();

  if (loading) {
    return <PageLoader />;
  }

  const fallbackMainColor = createAppTheme().palette.primary.main;
  const organizationMainColor = mainColor || fallbackMainColor;

  const theme = createTheme({
    palette: {
      primary: {
        main: `rgba(${hexToRgb(organizationMainColor)}, 0.8)`,
        contrastText: textColor ?? "#FFFFFF",
        light: `rgba(${hexToRgb(organizationMainColor)}, 0.1)`,
        dark: `rgba(${hexToRgb(organizationMainColor)}, 1)`,
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <OrganizationLocalizationProvider
        organizationId={organizationId}
        organizationType={organizationType}
        block={false}
      >
        <ArchitectAvailabilityPreview />
      </OrganizationLocalizationProvider>
    </ThemeProvider>
  );
};

export const Home = () => {
  return (
    <OrganizationDetailsProvider blockTheme={false}>
      <OrganizationDetailsWrapper />
    </OrganizationDetailsProvider>
  );
};

export default Home;
