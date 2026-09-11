import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";
import {
    OrganizationDetailsProvider,
    useOrganization,
} from "@/features/components/providers/OrganizationThemeProvider";
import WorkOrderHome from "@/features/reportsPage/workOrder/WorkOrderHome";
import { hexToRgb } from "@/lib/helpers";
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
        return <p>Loading....</p>;
    }

    const theme = createTheme({
        palette: {
            primary: {
                main: `rgba(${hexToRgb(mainColor)}, 0.8)`,
                contrastText: textColor ?? "#FFFFFF",
                light: `rgba(${hexToRgb(mainColor)}, 0.1)`,
                dark: `rgba(${hexToRgb(mainColor)}, 1)`,
            },
        },
    });

    return (
        <>
            <ThemeProvider theme={theme}>
                <OrganizationLocalizationProvider
                    organizationId={organizationId}
                    organizationType={organizationType}
                >
                    <WorkOrderHome />
                </OrganizationLocalizationProvider>
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

