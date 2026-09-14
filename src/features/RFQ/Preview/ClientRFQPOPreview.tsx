import { Box, Grid } from "@mui/material";
import React from "react";
import type {
  ClientRFQPOPreviewHandle,
  CreateRFQPOPreviewProps,
} from "./components/clientRfqPreviewTypes";
import { useClientRFQPOPreview } from "./components/useClientRFQPOPreview";
import { ClientRFQPOPreviewCommentHandler } from "./components/ClientRFQPOPreviewCommentHandler";
import { ClientRFQPOPreviewHeader } from "./components/ClientRFQPOPreviewHeader";
import { ClientRFQPOPreviewLineItemsTable } from "./components/ClientRFQPOPreviewLineItemsTable";
import { ClientRFQPOPreviewMobileLineItems } from "./components/ClientRFQPOPreviewMobileLineItems";
import { ClientRFQPOPreviewTotals } from "./components/ClientRFQPOPreviewTotals";
import { ClientRFQPOPreviewSuggestions } from "./components/ClientRFQPOPreviewSuggestions";

export type {
  ClientRFQPOPreviewHandle,
  CreateRFQPOPreviewProps,
} from "./components/clientRfqPreviewTypes";

const ClientRFQPOPreview = React.forwardRef<
  ClientRFQPOPreviewHandle,
  CreateRFQPOPreviewProps
>((props, ref) => {
  const {
    data,
    pdf,
    commentMode,
    vendorDetails,
    defaultOrganizationDetails,
    shippingDetails,
    isEditingAll,
  } = props;

  const view = useClientRFQPOPreview(
    {
      data,
      currency: props.currency,
      isEditingAll,
    },
    ref,
  );

  return (
    <>
      <Box
        className={`pl-1 ${view.isMobile ? "pr-1 tw-h-screen" : "pr-2"}`}
        sx={{
          height: view.isMobile ? "100vh" : "auto",
          overflowY: view.isMobile ? "auto" : "visible",
          display: "flex",
          flexDirection: "column",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        <ClientRFQPOPreviewCommentHandler
          commentPopupRef={view.commentPopupRef}
          data={data}
          structuredRfqComments={view.structuredRfqComments}
          addComments={view.addComments}
          setStructuredRfqComments={view.setStructuredRfqComments}
        />
        <Grid
          id="rfq-preview-pdf"
          className={`${view.isMobile ? "px-1" : "px-sm-0"} ${
            pdf ? "px-md-0" : "px-md-1"
          } ${view.isMobile ? "px-1" : "px-3"} w-100`}
        >
          <Box
            sx={{
              width: commentMode && !view.isMobile ? "80%" : "100%",
            }}
          >
            <ClientRFQPOPreviewHeader
              data={data}
              pdf={pdf}
              isMobile={view.isMobile}
              localizationValue={view.localizationValue}
              t={view.t}
              tabs={view.tabs}
              activeTab={view.activeTab}
              setActiveTab={view.setActiveTab}
              getProjectId={view.getProjectId as string | string[]}
              shippingDetails={shippingDetails}
              defaultOrganizationDetails={defaultOrganizationDetails}
              vendorDetails={vendorDetails}
            />
            <Box
              className={`bg-white ${view.isMobile ? "" : "border"} pt-2`}
              sx={view.isMobile ? undefined : { mx: 2 }}
            >
              <ClientRFQPOPreviewLineItemsTable
                data={data}
                pdf={pdf}
                isMobile={view.isMobile}
                commentMode={commentMode}
                isEditingAll={isEditingAll}
                editingRate={view.editingRate}
                rateValue={view.rateValue}
                setRateValue={view.setRateValue}
                editedRatesById={view.editedRatesById}
                setEditedRatesById={view.setEditedRatesById}
                updatingRate={view.updatingRate}
                hoveredRow={view.hoveredRow}
                setHoveredRow={view.setHoveredRow}
                commentPopupRef={view.commentPopupRef}
                localizationValue={view.localizationValue}
                t={view.t}
                formatCurrency={view.formatCurrency}
                handleRateEdit={view.handleRateEdit}
              />
              <ClientRFQPOPreviewMobileLineItems
                data={data}
                isMobile={view.isMobile}
                commentMode={commentMode}
                isEditingAll={isEditingAll}
                editingRate={view.editingRate}
                rateValue={view.rateValue}
                setRateValue={view.setRateValue}
                editedRatesById={view.editedRatesById}
                setEditedRatesById={view.setEditedRatesById}
                updatingRate={view.updatingRate}
                hoveredRow={view.hoveredRow}
                setHoveredRow={view.setHoveredRow}
                commentPopupRef={view.commentPopupRef}
                dialogState={view.dialogState}
                handleDialogOpen={view.handleDialogOpen}
                handleDialogClose={view.handleDialogClose}
                localizationValue={view.localizationValue}
                t={view.t}
                formatCurrency={view.formatCurrency}
                handleRateEdit={view.handleRateEdit}
                updateMessage={view.updateMessage}
              />
              <ClientRFQPOPreviewTotals
                data={data}
                pdf={pdf}
                isMobile={view.isMobile}
                isEditingAll={isEditingAll}
                editingRate={view.editingRate}
                totals={view.totals}
                formatCurrency={view.formatCurrency}
                t={view.t}
                loading={view.loading}
              />
            </Box>
          </Box>

          {commentMode && (
            <ClientRFQPOPreviewSuggestions
              isMobile={view.isMobile}
              structuredRfqComments={view.structuredRfqComments}
              t={view.t}
              pdf={pdf}
            />
          )}
        </Grid>
      </Box>
    </>
  );
});

ClientRFQPOPreview.displayName = "ClientRFQPOPreview";

export default ClientRFQPOPreview;
