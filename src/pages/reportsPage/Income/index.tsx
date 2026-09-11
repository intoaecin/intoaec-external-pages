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
import EstimateHome from "@/features/reportsPage/estimate/EstimateHome";
import ExpensesHome from "@/features/reportsPage/expenses/ExpensesHome";
import IncomeHome from "@/features/reportsPage/income/IncomeHome";
import { hexToRgb } from "@/lib/helpers";
import { ThemeProvider, createTheme } from "@mui/material";

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
    return <p>Loading....</p>;
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
      <ThemeProvider theme={theme}>
        <OrganizationLocalizationProvider
          organizationId={organizationId}
          organizationType={organizationType}
        >
          <IncomeHome />
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

