import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";
import {
  ClientPoDataProvider,
  useClientPoData,
} from "@/features/components/providers/PoProvider/ClientPoDataProvider";
import { PoSuggestionProvider } from "@/features/components/providers/RfqProvider/PoSuggestionProvider";
import { OrganizationDetailsProvider, useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { useRouter } from "next/router";
import POPreview from "@/features/PurchaseAndWorkOrder/Preview/POPreview";
import PoClientHeader from "@/features/components/RFQ/PoClientHeader";
import PoCommentHeader from "@/features/components/RFQ/PoCommentHeader";
import { Box } from "@mui/material";
import { useState } from "react";
import PageLoader from "@/features/components/Loader/PageLoader";
import FallbackExternalPage from "@/components/FallbackExternalPage";
import { useTranslation } from "react-i18next";

const ClientPoPreviewWrapper = ({ poId }: { poId: string }) => {
  const { t } = useTranslation();
  const { clientPoData, loading, error, refetch } = useClientPoData();
  const [commentMode, setCommentMode] = useState(false);

  // intoaec-UI resolves vendor contact details via useConnectedVendors(),
  // which calls GET_CONNECTED_ORGANIZATIONS with no organizationId in the
  // payload — the backend must derive "which organization" from an
  // authenticated session/JWT (type: "SOURCE"). This app has no session of
  // any kind, so that call can never resolve a vendor here and was dropped;
  // the vendor fields below fall through to clientPoData?.receiver* exactly
  // like they already do when useConnectedVendors finds no match in
  // intoaec-UI (see PoClientHeader/POPreview vendorDetails wiring there).
  const { organizationId } = useOrganization()

  if (loading) return <PageLoader />;
  if (error || !clientPoData)
    return (
      <FallbackExternalPage
        title={t("externalFallback.poPreview.title")}
        description={t("externalFallback.poPreview.description")}
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
  const allowComments = clientPoData?.allowComments ?? true;

  return (
    <>
      <OrganizationLocalizationProvider
        organizationId={clientPoData?.senderId}
        organizationType={clientPoData?.senderType}
        serialNumber={clientPoData?.serialNumber}
        isAuth={withAuth}
      >
        <PoSuggestionProvider
          vendorRfqId={clientPoData?.poId ?? ""}
          vendorRfqData={clientPoData}
          organizationId={organizationId}
        >
          {commentMode && allowComments !== false ? (
            <PoCommentHeader rfqTitle="" setCommentMode={setCommentMode} />
          ) : (
            <PoClientHeader
              poId={poId}
              poData={clientPoData}
              commentMode={commentMode}
              setCommentMode={setCommentMode}
              vendorDetails={{
                vendorName: clientPoData?.receiverName ?? "",
                vendorEmail: clientPoData?.receiverEmail ?? "",
                vendorMobile: clientPoData?.receiverMobile ?? "",
                vendorLocation: clientPoData?.receiverAddress ?? "",
                vendorTaxId: "",
                vendorTaxName: "",
              }}
              refetchPo={refetch}
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
            <POPreview
              data={clientPoData}
              organizationId={clientPoData?.senderId}
              commentMode={allowComments !== false && commentMode}
              defaultShippingDetails={{
                city: clientPoData?.shippingAddress,
                mobileNumber: clientPoData?.shippingContact,
                emailAddress: clientPoData?.shippingEmail,
                firstName: clientPoData?.shippingName,
              }}
              vendorDetails={{
                vendorName: clientPoData?.receiverName ?? "",
                vendorEmail: clientPoData?.receiverEmail ?? "",
                vendorMobile: clientPoData?.receiverMobile ?? "",
                vendorLocation: clientPoData?.receiverAddress ?? "",
                vendorTaxId: "",
                vendorTaxName: "",
              }}
              createdOn={clientPoData?.createdAt}
              currency={clientPoData?.currency}
              isWorkOrder={clientPoData?.isWorkOrder}
            />
          </Box>
        </PoSuggestionProvider>
      </OrganizationLocalizationProvider>
    </>
  );
};

const Home = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const poId = router.query?.poid as string | undefined;

  if (!router.isReady) return <PageLoader />;
  if (!poId)
    return (
      <FallbackExternalPage
        title={t("externalFallback.poPreview.title")}
        description={t("externalFallback.poPreview.description")}
      />
    );

  return (
    <OrganizationDetailsProvider>
      <ClientPoDataProvider poId={poId}>
        <ClientPoPreviewWrapper poId={poId} />
      </ClientPoDataProvider>
    </OrganizationDetailsProvider>
  );
};

export default Home;
