import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";
import {
    OrganizationDetailsProvider,
    useOrganization,
} from "@/features/components/providers/OrganizationThemeProvider";
import WorkOrderHome from "@/features/reportsPage/workOrder/WorkOrderHome";

const OrganizationDetailsWrapper = () => {
    const {
        loading,
        organizationId,
        organizationType,
    } = useOrganization();

    if (loading) {
        return <p>Loading....</p>;
    }

    return (
        <>
            <OrganizationLocalizationProvider
                organizationId={organizationId}
                organizationType={organizationType}
            >
                <WorkOrderHome />
            </OrganizationLocalizationProvider>
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

