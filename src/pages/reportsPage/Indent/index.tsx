import { LeadDataProvider } from "@/features/components/providers/LeadProfileProvider";
import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";
import {
    OrganizationDetailsProvider,
    useOrganization,
} from "@/features/components/providers/OrganizationThemeProvider";
import IndentHome from "@/features/reportsPage/indent/IndentHome";

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
                <LeadDataProvider>
                    <IndentHome />
                </LeadDataProvider>
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

