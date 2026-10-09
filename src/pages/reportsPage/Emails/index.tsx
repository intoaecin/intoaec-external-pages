// import AccessDenied from "@/features/components/accessDenied";
// import ClientsHome from "@/features/reports/clients/ClientsHome";
// import ReportsHome from "@/features/reports/ReportsHome";
// import { checkAccessForComponent } from "@/lib/helpers";
// import { PathsKeyForPermission } from "@/types";
// import { useSession } from "@/features/reportsPage/publicRuntime";
// import { useRouter } from "@/features/reportsPage/publicRuntime";
// import { useEffect } from "react";

// export default function Home() {
//   const { data: session } = useSession();
//   const router = useRouter();

//   useEffect(() => {
//     console.log("SESSIONSSS:::::::::", session);
//   }, [session]);

//   return (
//     <div>
//       <ClientsHome />
//       {/* {session &&
//       checkAccessForComponent(session, PathsKeyForPermission?.REPORTS) ? (
//         // <Subscription />
//       ) : (
//         <AccessDenied />
//       )} */}
//     </div>
//   );
// }

import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";
import {
  OrganizationDetailsProvider,
  useOrganization,
} from "@/features/components/providers/OrganizationThemeProvider";
import ClientsHome from "@/features/reportsPage/clients/ClientsHome";
import EmailsHome from "@/features/reportsPage/emails/EmailsHome";

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
      <OrganizationLocalizationProvider
        organizationId={organizationId}
        organizationType={organizationType}
      >
        <EmailsHome />
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

