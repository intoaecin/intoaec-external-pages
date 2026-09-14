import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";
import {
  ClientRfqDataProvider,
  useClientRfqData,
} from "@/features/components/providers/RfqProvider/ClientRfqDataProvider";
import { RfqSuggestionProvider } from "@/features/components/providers/RfqProvider/RfqSuggestionProvider";
import {
  OrganizationDetailsProvider,
  useOrganization,
} from "@/features/components/providers/OrganizationThemeProvider";
import { useRouter } from "next/router";
import RfqClientHeader from "@/features/components/RFQ/RfqClientHeader";
import RfqCommentHeader from "@/features/components/RFQ/RfqCommentMOdeHeader";
import { Box } from "@mui/material";
import { useState } from "react";
import ClientRFQPOPreview from "@/features/RFQ/Preview/ClientRFQPOPreview";
import React from "react";
import type { ClientRFQPOPreviewHandle } from "@/features/RFQ/Preview/ClientRFQPOPreview";
import PageLoader from "@/features/components/Loader/PageLoader";
import FallbackExternalPage from "@/components/FallbackExternalPage";
import { useTranslation } from "react-i18next";

const ClientRfqPreviewWrapper = ({ rfqId }: { rfqId: string }) => {
  const { t } = useTranslation();
  const { clientRfqData, loading, error, refetch } = useClientRfqData();
  const [commentMode, setCommentMode] = useState(false);
  const [isEditingPrices, setIsEditingPrices] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const previewRef = React.useRef<ClientRFQPOPreviewHandle | null>(null);
  const { organizationId, organizationType } = useOrganization();

  if (loading) return <PageLoader />;
  if (error || !clientRfqData)
    return (
      <FallbackExternalPage
        title={t("externalFallback.rfqPreview.title")}
        description={t("externalFallback.rfqPreview.description")}
      />
    );

  // intoaec-UI's `useRouter().origin` has no equivalent on the aliased
  // next/router (react-router-dom based) — window.location.origin is the
  // same value it was ever reading.
  const withAuth = window.location.origin
    ?.replace("https://", "")
    .replace("http://", "")
    .split(".")[0]
    .includes("app")
    ? true
    : false;
  const allowComments =
    clientRfqData?.allowComments ?? clientRfqData?.rfq?.allowComments ?? true;

  return (
    <>
      <OrganizationLocalizationProvider
        organizationId={organizationId}
        organizationType={organizationType}
        serialNumber={clientRfqData?.serialNumber}
        isAuth={withAuth}
      >
        <RfqSuggestionProvider
          withAuth={withAuth}
          vendorRfqId={clientRfqData?.vendorRfqId}
          vendorRfqData={clientRfqData}
        >
          {commentMode && allowComments !== false ? (
            <RfqCommentHeader
              rfqTitle=""
              setCommentMode={setCommentMode}
              onCommentsSaved={refetch}
            />
          ) : (
            <RfqClientHeader
              rfqId={rfqId}
              rfqData={clientRfqData}
              commentMode={commentMode}
              setCommentMode={setCommentMode}
              vendorDetails={{
                vendorName: clientRfqData?.receiverName ?? "",
                vendorEmail: clientRfqData?.receiverEmail ?? "",
                vendorMobile: clientRfqData?.receiverMobile ?? "",
                vendorLocation: clientRfqData?.receiverAddress ?? "",
                vendorTaxId: clientRfqData?.receiverTaxId ?? "",
                vendorTaxName: clientRfqData?.receiverTaxName ?? "",
              }}
              isEditingPrices={isEditingPrices}
              onToggleEditPrices={() => setIsEditingPrices((p) => !p)}
              onUpdatePricesClick={async () => {
                try {
                  setIsSaving(true);
                  await previewRef.current?.saveAllRates();
                  await refetch();
                  setIsEditingPrices(false);
                } finally {
                  setIsSaving(false);
                }
              }}
              isSaving={isSaving}
            />
          )}
          <Box
            className="bg-white"
            sx={{
              padding: {
                xs: ".5rem",
                sm: "1.5rem",
              },
              position: "relative",
              zIndex: 1,
            }}
          >
            <ClientRFQPOPreview
              ref={previewRef}
              data={clientRfqData}
              commentMode={allowComments !== false && commentMode}
              isEditingAll={isEditingPrices}
              shippingDetails={{
                city: clientRfqData?.rfq?.shippingAddress ?? "",
                mobileNumber: clientRfqData?.rfq?.shippingContact ?? "",
                emailAddress: clientRfqData?.rfq?.shippingEmail ?? "",
                firstName:
                  clientRfqData?.rfq?.shippingName?.split(" ")[0] ?? "",
                lastName:
                  clientRfqData?.rfq?.shippingName
                    ?.split(" ")
                    .slice(1)
                    .join(" ") ?? "",
                addressLine1: clientRfqData?.rfq?.shippingAddress ?? "",
                addressLine2: clientRfqData?.rfq?.shippingAddress2 ?? "",
              }}
              vendorDetails={{
                vendorName: clientRfqData?.receiverName ?? "",
                vendorEmail: clientRfqData?.receiverEmail ?? "",
                vendorMobile: clientRfqData?.receiverMobile ?? "",
                vendorLocation: clientRfqData?.receiverAddress ?? "",
                vendorTaxName: clientRfqData?.receiverTaxName ?? "",
                vendorTaxId: clientRfqData?.receiverTaxId ?? "",
              }}
              createdOn={clientRfqData?.createdAt}
              currency={clientRfqData?.currency}
            />
          </Box>
        </RfqSuggestionProvider>
      </OrganizationLocalizationProvider>
    </>
  );
};

const Home = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const rfqId = router.query?.rfqid as string | undefined;

  if (!router.isReady) return <PageLoader />;
  if (!rfqId)
    return (
      <FallbackExternalPage
        title={t("externalFallback.rfqPreview.title")}
        description={t("externalFallback.rfqPreview.description")}
      />
    );

  return (
    <OrganizationDetailsProvider>
      <ClientRfqDataProvider rfqId={rfqId}>
        <ClientRfqPreviewWrapper rfqId={rfqId} />
      </ClientRfqDataProvider>
    </OrganizationDetailsProvider>
  );
};

export default Home;
