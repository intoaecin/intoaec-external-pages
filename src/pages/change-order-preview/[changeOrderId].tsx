import ChangeOrderAcceptAndSignHeader from "@/features/changeOrder/components/ChangeOrderAcceptAndSignHeader";
import {
  ChangeOrderPreviewContent,
  type ChangeOrderPreviewData,
} from "@/features/changeOrder/components/ChangeOrderPreview";
import {
  ChangeOrderDataProvider,
  useChangeOrderData,
} from "@/features/components/providers/ChangeOrderProvider/ChangeOrderDataProvider";
import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";
import {
  OrganizationDetailsProvider,
  useOrganization,
} from "@/features/components/providers/OrganizationThemeProvider";
import PageLoader from "@/features/components/Loader/PageLoader";
import FallbackExternalPage from "@/components/FallbackExternalPage";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import {
  decryptAES,
  encryptAES,
  fetchAndInlineResources,
  getLocalizationValue,
  hexToRgb,
} from "@/lib/helpers";
import { Box, createTheme, ThemeProvider } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const OrganizationDetailsWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { loading, mainColor, textColor } = useOrganization();

  if (loading) return <PageLoader />;

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

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

const ChangeOrderPageContent = () => {
  const { t } = useTranslation();
  const {
    VITE_AEC_CHATBOT_ENDPOINT,
    VITE_AEC_PORTAL_URL,
    VITE_USERHUB_ENDPOINT,
    VITE_ACCESS_KEY,
  } = useEnv();
  const {
    changeOrder: fetchedChangeOrder,
    organizationName,
    loading,
    error,
  } = useChangeOrderData();

  const [changeOrder, setChangeOrder] = useState<
    ChangeOrderPreviewData | undefined
  >(fetchedChangeOrder);
  const [downloading, setDownloading] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string>();
  const [isStripeIntegrated, setIsStripeIntegrated] = useState(false);
  const [paymentLinkLoading, setPaymentLinkLoading] = useState(false);

  const { post: integrationPost } = useAxios<any>(
    `${VITE_USERHUB_ENDPOINT}/integrations`,
  );
  const { post: organizationPost } = useAxios<any>(
    `${VITE_USERHUB_ENDPOINT}/organization`,
  );
  const { post: sessionPost } = useAxios<any>(
    `${VITE_USERHUB_ENDPOINT}/session`,
  );
  const { post: localizationPost } = useAxios<any>(
    `${VITE_USERHUB_ENDPOINT}/userhub`,
  );

  // Keep local state in sync with the provider so accept/decline can apply
  // an optimistic patch on top of it (mirrors the source page's own
  // `useState(initialChangeOrder)` seeded from `getServerSideProps`).
  useEffect(() => {
    setChangeOrder(fetchedChangeOrder);
  }, [fetchedChangeOrder]);

  // Stripe "Pay Now" link generation — ported faithfully from the source
  // page. This is self-contained USERHUB/apiKey calls (no auth needed) and
  // should work as-is, but the resulting link points at
  // `/estimatePayments/checkout-payment`, a page that has not been ported
  // into this app and is out of scope for this task — the button will 404
  // until that flow is built here (or the org has no Stripe integration, in
  // which case `showPayNow` stays false and the button never renders).
  useEffect(() => {
    if (!changeOrder?.organizationId || !changeOrder?.changeOrderId) return;
    const unpaidTerms = (changeOrder.estimatePaymentTerms ?? []).filter(
      (term) =>
        String(term.status ?? "").toUpperCase() !== "PAID" && !term.isPaid,
    );
    if (!unpaidTerms.length) {
      setPaymentLink(undefined);
      setIsStripeIntegrated(false);
      return;
    }

    const generateLink = async () => {
      setPaymentLinkLoading(true);
      setIsStripeIntegrated(false);
      try {
        const organizationType = changeOrder.organizationType ?? "AEC";
        const [
          integrationResponse,
          organizationResponse,
          addressResponse,
          superAdminResponse,
          localizationResponse,
        ] = await Promise.all([
          integrationPost({
            eventType: "GET_INTEGRATION_DETAILS",
            organizationId: changeOrder.organizationId,
            organizationType,
            name: "STRIPE",
          }),
          organizationPost({
            eventType: "GET_ORGANIZATION_DETAILS",
            organizationId: changeOrder.organizationId,
          }),
          organizationPost({
            eventType: "GET_ORGANIZATION_ADDRESS_INFO",
            organizationId: changeOrder.organizationId,
          }),
          sessionPost({
            eventType: "GET_ORGANIZATION_SUPER_USER",
            organizationId: changeOrder.organizationId,
          }),
          localizationPost({
            eventType: "FETCH_ORGANIZATION_LOCALIZATION",
            organizationId: changeOrder.organizationId,
            organizationType,
          }),
        ]);

        const body = integrationResponse?.body;
        const publishKeyObj = Array.isArray(body)
          ? body.find(
              (item: { keyName?: string; valueofKey?: string }) =>
                item.keyName === "publishKey" && item.valueofKey,
            )
          : undefined;

        if (!publishKeyObj?.valueofKey) {
          setPaymentLink(undefined);
          return;
        }

        setIsStripeIntegrated(true);

        const decryptedPublishKey = decryptAES(
          publishKeyObj.valueofKey,
          VITE_ACCESS_KEY,
        );
        if (!decryptedPublishKey) return;

        const localization = localizationResponse?.body ?? [];
        const organization = organizationResponse?.body ?? {};
        const superAdmin = superAdminResponse?.body?.[0] ?? {};

        const encryptedData = await encryptAES(
          JSON.stringify({
            sourceType: "CHANGE_ORDER",
            changeOrderId: changeOrder.changeOrderId,
            estimateId: changeOrder.changeOrderId,
            estimateTitle: changeOrder.changeOrderTitle,
            estimatePaymentTerms: unpaidTerms,
            organizationId: changeOrder.organizationId,
            senderId: changeOrder.organizationId,
            senderType: organizationType,
            receiverId: changeOrder.leadId,
            publishKey: decryptedPublishKey,
            organizationName:
              organization.organizationName || organizationName,
            organizationAddress: addressResponse?.body ?? {},
            emailId: superAdmin.emailId,
            mobileNumber: superAdmin.mobileNumber,
            clientInformation: {
              fullName: changeOrder.leadName || changeOrder.clientName || "-",
              emailId: changeOrder.leadEmail || "",
              mobileNumber: changeOrder.leadMobile || "",
            },
            clientEmail: changeOrder.leadEmail,
            currencyCode:
              getLocalizationValue(localization, "CURRENCY", "CODE") ??
              "USD",
            currency:
              getLocalizationValue(localization, "CURRENCY", "SYMBOL") ??
              changeOrder.currency ??
              "$",
          }),
          VITE_ACCESS_KEY,
        );

        const origin =
          typeof window !== "undefined"
            ? window.location.origin
            : (VITE_AEC_PORTAL_URL ?? "");

        setPaymentLink(
          `${origin}/estimatePayments/checkout-payment?data=${encodeURIComponent(
            encryptedData,
          )}`,
        );
      } catch (err) {
        console.error("Failed to generate payment link for change order", err);
        setPaymentLink(undefined);
        setIsStripeIntegrated(false);
      } finally {
        setPaymentLinkLoading(false);
      }
    };

    void generateLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeOrder, organizationName]);

  const handleDownloadPdf = async () => {
    if (!changeOrder?.changeOrderId || downloading) return;
    setDownloading(true);
    try {
      if (!VITE_AEC_CHATBOT_ENDPOINT) {
        throw new Error("PDF download service is unavailable");
      }

      // This app has no server of its own — the printable HTML lives on the
      // real intoaec-UI app's `/createChangeOrderPreview` App Router page,
      // so forward there (same pattern as the already-wired estimate/RFQ PDF
      // downloads). NOTE: unlike `/createEstimatePreview`,
      // `/createChangeOrderPreview` does not yet have CORS headers added in
      // intoaec-UI's `next.config.js` — this fetch will fail cross-origin
      // in real testing until that is added there. Flagging for the user to
      // decide, exactly like the RFQ `/client-rfqexport` situation — not
      // fixing intoaec-UI's config from here.
      const previewPath = `${VITE_AEC_PORTAL_URL}/createChangeOrderPreview?changeOrderId=${encodeURIComponent(
        changeOrder.changeOrderId,
      )}`;
      const previewResponse = await fetch(previewPath);
      if (!previewResponse.ok) {
        throw new Error(
          `Change order preview request failed with status ${previewResponse.status}`,
        );
      }
      const previewHtml = await previewResponse.text();
      if (!previewHtml.trim()) {
        throw new Error("Change order preview returned empty HTML");
      }

      const htmlContent = (
        await fetchAndInlineResources(previewHtml, VITE_AEC_PORTAL_URL)
      ).replaceAll("h-100", "");

      const response = await axios.post(
        `${VITE_AEC_CHATBOT_ENDPOINT}/download-pdf`,
        {
          htmlContent,
          fileName: `${changeOrder.changeOrderSerial || "change-order"}.pdf`,
        },
        { responseType: "arraybuffer" },
      );

      const blobUrl = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${changeOrder.changeOrderSerial || "change-order"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      toast.error(
        t("toast.somethingWentWrong", {
          defaultValue: "Failed to download PDF.",
        }),
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleAcceptSuccess = (updated?: ChangeOrderPreviewData) => {
    if (updated && updated.changeOrderId) {
      setChangeOrder((prev) => (prev ? { ...prev, ...updated } : updated));
    } else {
      setChangeOrder((prev) =>
        prev
          ? {
              ...prev,
              status: "ACCEPTED",
              acceptedAt: Date.now(),
            }
          : prev,
      );
    }
  };

  const handleDeclineSuccess = (updated?: ChangeOrderPreviewData) => {
    if (updated && updated.changeOrderId) {
      setChangeOrder((prev) => (prev ? { ...prev, ...updated } : updated));
    } else {
      setChangeOrder((prev) =>
        prev
          ? {
              ...prev,
              status: "REJECTED",
              declinedAt: Date.now(),
            }
          : prev,
      );
    }
  };

  if (loading) return <PageLoader />;

  if (error || !changeOrder) {
    return (
      <FallbackExternalPage
        title={t("externalFallback.changeOrder.title", {
          defaultValue: "Change order unavailable",
        })}
        description={t("externalFallback.changeOrder.description", {
          defaultValue:
            "We couldn't load this change order. It may have been removed or the link is invalid.",
        })}
      />
    );
  }

  return (
    <OrganizationLocalizationProvider
      organizationId={changeOrder.organizationId}
      organizationType={changeOrder.organizationType}
    >
      <OrganizationDetailsWrapper>
        <Box
          sx={{
            minHeight: "100vh",
            bgcolor: "background.default",
          }}
        >
          <ChangeOrderAcceptAndSignHeader
            changeOrder={changeOrder}
            onAcceptSuccess={handleAcceptSuccess}
            onDeclineSuccess={handleDeclineSuccess}
            onDownloadPdf={handleDownloadPdf}
            downloading={downloading}
          />
          <Box sx={{ p: { xs: 1, md: 3 } }}>
            <ChangeOrderPreviewContent
              changeOrder={changeOrder}
              currency={changeOrder.currency ?? ""}
              projectId={changeOrder.projectId}
              organizationId={changeOrder.organizationId}
              organizationName={organizationName}
              withAuth={false}
              reversePriceColors
              showDocumentTitle={false}
              showPayNow={isStripeIntegrated}
              paymentLink={paymentLink}
              paymentLinkLoading={paymentLinkLoading}
            />
          </Box>
        </Box>
      </OrganizationDetailsWrapper>
    </OrganizationLocalizationProvider>
  );
};

const Home = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const changeOrderId = router.query?.changeOrderId;

  if (!router.isReady) return <PageLoader />;
  if (!changeOrderId) {
    return (
      <FallbackExternalPage
        title={t("externalFallback.changeOrder.title", {
          defaultValue: "Change order unavailable",
        })}
        description={t("externalFallback.changeOrder.description", {
          defaultValue:
            "We couldn't load this change order. It may have been removed or the link is invalid.",
        })}
      />
    );
  }

  return (
    <OrganizationDetailsProvider>
      <ChangeOrderDataProvider changeOrderId={changeOrderId as string}>
        <ChangeOrderPageContent />
      </ChangeOrderDataProvider>
    </OrganizationDetailsProvider>
  );
};

export default Home;
