import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";
import {
  OrganizationDetailsProvider,
  useOrganization,
} from "@/features/components/providers/OrganizationThemeProvider";
import PageLoader from "@/features/components/Loader/PageLoader";
import FallbackExternalPage from "@/components/FallbackExternalPage";
import ProgressClaimAcceptPage from "@/features/projectSchedule/progressClaim/external/ProgressClaimAcceptPage";
import type { ProgressClaim } from "@/features/projectSchedule/progressClaim/hooks/api/create-progress-claim";
import { useFetchProgressClaimById } from "@/features/projectSchedule/progressClaim/hooks/api/fetch-progress-claim";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

// The accept flow only makes sense once the claim has actually been sent to
// the client (or already decided) — a claim still pending internal approval
// has nothing for the client to review, so it's treated like an unavailable link.
const REVIEWABLE_STATUSES: ProgressClaim["status"][] = ["SENT", "ACCEPTED", "REJECTED"];

const OrganizationDetailsWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { loading } = useOrganization();

  if (loading) return <PageLoader />;

  return <>{children}</>;
};

const ProgressClaimUnavailable = () => {
  const { t } = useTranslation();

  return (
    <FallbackExternalPage
      title={t("externalFallback.progressClaim.title", {
        defaultValue: "Progress claim unavailable",
      })}
      description={t("externalFallback.progressClaim.description", {
        defaultValue:
          "We couldn't load this progress claim. It may have been removed or the link is invalid.",
      })}
    />
  );
};

// intoaec-UI fetches the claim in `getServerSideProps`; this app is a static
// SPA, so the same request is made from the browser (apiKey only, no session).
const ProgressClaimPageContent = ({ progressClaimId }: { progressClaimId: string }) => {
  const { claim, loading } = useFetchProgressClaimById(progressClaimId, false);

  if (loading) return <PageLoader />;
  if (!claim || !REVIEWABLE_STATUSES.includes(claim.status)) {
    return <ProgressClaimUnavailable />;
  }

  return (
    <OrganizationLocalizationProvider
      organizationId={claim.organizationId}
      organizationType={claim.organizationType}
    >
      <OrganizationDetailsWrapper>
        <ProgressClaimAcceptPage claim={claim} />
      </OrganizationDetailsWrapper>
    </OrganizationLocalizationProvider>
  );
};

const Home = () => {
  const router = useRouter();
  const progressClaimId = router.query?.progressClaimId;

  if (!router.isReady) return <PageLoader />;
  if (!progressClaimId) return <ProgressClaimUnavailable />;

  return (
    <OrganizationDetailsProvider>
      <ProgressClaimPageContent progressClaimId={progressClaimId as string} />
    </OrganizationDetailsProvider>
  );
};

export default Home;
