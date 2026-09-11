import { LeadProposalWrapper } from "@/features/components/proposal/PreviewProposalWrapper";
import {
  LeadProposalProvider,
  useLeadProposalData,
} from "@/features/components/providers/LeadProposalProvider";
import { ProposalSuggestionProvider } from "@/features/components/providers/ProposalProviders/ProposalSuggestionProvider";
import { DialogProvider } from "@/features/components/providers/DialogProvider";
import PageLoader from "@/features/components/Loader/PageLoader";
import { PlateController } from "@udecode/plate-common";
import FallbackExternalPage from "@/components/FallbackExternalPage";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

const LeadProposalContent = () => {
  const { t } = useTranslation();
  const { proposalData, loading, error } = useLeadProposalData();

  if (loading) return <PageLoader />;
  if (error || !proposalData || !proposalData.pages)
    return (
      <FallbackExternalPage
        title={t("externalFallback.proposal.title")}
        description={t("externalFallback.proposal.description")}
      />
    );

  return <LeadProposalWrapper />;
};

const Home = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const leadProposalId = router?.query?.leadProposalId;

  return (
    <>
      {!router.isReady ? (
        <PageLoader />
      ) : !leadProposalId ? (
        <FallbackExternalPage
          title={t("externalFallback.proposal.title")}
          description={t("externalFallback.proposal.description")}
        />
      ) : (
        <DialogProvider>
          <LeadProposalProvider
            expiryCheck={true}
            leadProposalId={leadProposalId as string}
            proposalRevision={router?.query?.proposalRevision as any}
          >
            <ProposalSuggestionProvider
              leadProposalId={leadProposalId as string}
              proposalRevision={router?.query?.proposalRevision as any}
            >
              <PlateController>
                <LeadProposalContent />
              </PlateController>
            </ProposalSuggestionProvider>
          </LeadProposalProvider>
        </DialogProvider>
      )}
    </>
  );
};

export default Home;
