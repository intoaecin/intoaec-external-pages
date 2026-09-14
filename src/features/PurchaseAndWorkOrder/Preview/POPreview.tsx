import {
  Box,
  Grid,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import {
  fetchContentFromS3,
  getLocalizationValue,
} from "@/lib/helpers";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { useRouter } from "next/router";
import { usePoCommentsData } from "@/features/components/providers/RfqProvider/PoSuggestionProvider";
import { useTranslation } from "react-i18next";
import type { CreateRFQPOPreviewProps } from "./components/poPreviewTypes";
import {
  getPOPreviewAttachmentItems,
  normalizeTermsAndConditionData,
  type OpenDialogItemState,
} from "./components/poPreviewUtils";
import { POPreviewCommentHandler } from "./components/POPreviewCommentHandler";
import { POPreviewDocumentHeader } from "./components/POPreviewDocumentHeader";
import { POPreviewLineItemsTable } from "./components/POPreviewLineItemsTable";
import { POPreviewMobileLineItems } from "./components/POPreviewMobileLineItems";
import { POPreviewTotalsAndAttachments } from "./components/POPreviewTotalsAndAttachments";
import { POPreviewTermsSection } from "./components/POPreviewTermsSection";
import { POPreviewSuggestionsPanel } from "./components/POPreviewSuggestionsPanel";

export type { CreateRFQPOPreviewProps } from "./components/poPreviewTypes";

// This is a Next.js `useSession()`-free port for the public, unauthenticated
// client PO/WO preview page in intoaec-external-pages. The admin app's
// `POPreview` reads `session` here only to `void` it (dead/unused) — see
// intoaec-UI's src/features/PurchaseAndWorkOrder/Preview/POPreview.tsx.
const POPreview = ({
  data,
  pdf,
  commentMode,
  vendorDetails,
  defaultOrganizationDetails,
  defaultShippingDetails,
  defaultTermsAndConditionData,
  isPreview,
  currency: defaultCurrency,
  organizationId,
  isWorkOrder = false,
}: CreateRFQPOPreviewProps) => {
  const commentPopupRef = useRef<any>();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [hoveredRow, setHoveredRow] = React.useState<number | null>(null);
  const { localizationValue } = useOrganizationLocalization();
  const [termsAndConditionData, setTermsAndConditionData] = useState<any>();
  const [currency, setCurrency] = useState<string>(defaultCurrency as any);
  const [activeTab, setActiveTab] = useState("Business Info");
  const tabs = ["Business Info", "Billed To", "Ship To"];
  const resolvedDefaultTermsAndConditionData =
    normalizeTermsAndConditionData(defaultTermsAndConditionData);
  const [hoveredTermsAndCondition, setHoveredTermsAndCondition] =
    useState(false);
  const { addComments, setStructuredPoComments, structuredPoComments } =
    usePoCommentsData();
  const [dialogState, setDialogState] = useState<OpenDialogItemState>({
    open: false,
    item: null,
  });

  const handleMouseEnter = () => {
    setHoveredTermsAndCondition(true);
  };

  const handleMouseLeave = () => {
    setHoveredTermsAndCondition(false);
  };

  useEffect(() => {
    if (localizationValue) {
      const curr =
        getLocalizationValue(localizationValue, "CURRENCY", "SYMBOL") ?? "";
      if (curr) {
        setCurrency(curr);
      }
    }
  }, [localizationValue]);

  const getProjectId = router?.query?.projectId ?? "";
  useEffect(() => {
    const fetchTermsAndConditions = async () => {
      try {
        if (data?.termsAndConditionsUrl) {
          const tdata = await fetchContentFromS3(data?.termsAndConditionsUrl);
          const termsData = normalizeTermsAndConditionData(tdata);
          setTermsAndConditionData(termsData);
        }
      } catch (error) {
        console.error("Error fetching terms and conditions:", error);
      }
    };

    if (!isPreview) {
      fetchTermsAndConditions();
    } else {
      setTermsAndConditionData(
        normalizeTermsAndConditionData(data?.termsAndConditionsData),
      );
    }
  }, [data]);

  const { t } = useTranslation();
  const previewAttachmentItems = getPOPreviewAttachmentItems(data);

  const handleDialogOpen = (item: any) => {
    setDialogState({ open: true, item });
  };

  const handleDialogClose = () => {
    setDialogState({ open: false, item: null });
  };

  void currency;

  return (
    <Box
      className={`pl-1 ${isMobile ? "pr-1 tw-h-screen" : "pr-2"}`}
      sx={{
        height: isMobile ? "100vh" : "auto",
        overflowY: isMobile ? "auto" : "visible",
        display: "flex",
        flexDirection: "column",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      <POPreviewCommentHandler
        commentPopupRef={commentPopupRef}
        data={data}
        structuredPoComments={structuredPoComments}
        addComments={addComments}
        setStructuredPoComments={setStructuredPoComments}
      />
      <Grid
        id="rfq-preview-pdf"
        className={`${isMobile ? "px-1" : "px-sm-0"} ${
          pdf ? "px-md-0" : "px-md-1"
        } ${isMobile ? "px-1" : "px-3"} w-100`}
      >
        <Box
          sx={{
            width: commentMode && !isMobile ? "80%" : "100%",
          }}
        >
          <POPreviewDocumentHeader
            data={data}
            pdf={pdf}
            isMobile={isMobile}
            isWorkOrder={isWorkOrder}
            localizationValue={localizationValue}
            t={t}
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            getProjectId={getProjectId as string | string[]}
            organizationId={organizationId}
            defaultShippingDetails={defaultShippingDetails}
            defaultOrganizationDetails={defaultOrganizationDetails}
            vendorDetails={vendorDetails}
          />
          <Box
            className={`bg-white ${isMobile ? "" : "border"} pt-2`}
            sx={isMobile ? undefined : { mx: 2 }}
          >
            <POPreviewLineItemsTable
              data={data}
              pdf={pdf}
              isMobile={isMobile}
              isWorkOrder={isWorkOrder}
              localizationValue={localizationValue}
              t={t}
              commentMode={commentMode}
              hoveredRow={hoveredRow}
              setHoveredRow={setHoveredRow}
              commentPopupRef={commentPopupRef}
            />
            <POPreviewMobileLineItems
              data={data}
              isMobile={isMobile}
              localizationValue={localizationValue}
              t={t}
              commentMode={commentMode}
              hoveredRow={hoveredRow}
              setHoveredRow={setHoveredRow}
              commentPopupRef={commentPopupRef}
              dialogState={dialogState}
              handleDialogOpen={handleDialogOpen}
              handleDialogClose={handleDialogClose}
            />
            <POPreviewTotalsAndAttachments
              data={data}
              pdf={pdf}
              isMobile={isMobile}
              isWorkOrder={isWorkOrder}
              localizationValue={localizationValue}
              t={t}
              previewAttachmentItems={previewAttachmentItems}
            />
            <POPreviewTermsSection
              data={data}
              pdf={pdf}
              isMobile={isMobile}
              commentMode={commentMode}
              hoveredTermsAndCondition={hoveredTermsAndCondition}
              handleMouseEnter={handleMouseEnter}
              handleMouseLeave={handleMouseLeave}
              commentPopupRef={commentPopupRef}
              resolvedDefaultTermsAndConditionData={
                resolvedDefaultTermsAndConditionData
              }
              termsAndConditionData={termsAndConditionData}
              t={t}
            />
          </Box>
        </Box>

        {commentMode && (
          <POPreviewSuggestionsPanel
            isMobile={isMobile}
            structuredPoComments={structuredPoComments}
            t={t}
          />
        )}
      </Grid>
    </Box>
  );
};

export default POPreview;
