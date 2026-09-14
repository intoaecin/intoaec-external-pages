import React, { useEffect, useRef, useState } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import { useRouter } from "next/router";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { useRfqCommentsData } from "@/features/components/providers/RfqProvider/RfqSuggestionProvider";
import { useTranslation } from "react-i18next";
import { useEnv } from "@/features/hooks/useEnv";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { getLocalizationValue } from "@/lib/helpers";
import { toast } from "react-toastify";
import type {
  ClientRFQPOPreviewHandle,
  CreateRFQPOPreviewProps,
  OpenDialogItemState,
  VendorRfqLineItem,
} from "./clientRfqPreviewTypes";
import {
  calcClientRfqTotals,
  formatClientRfqCurrency,
} from "./clientRfqPreviewUtils";

export function useClientRFQPOPreview(
  {
    data,
    currency: defaultCurrency,
    isEditingAll,
  }: Pick<CreateRFQPOPreviewProps, "data" | "currency" | "isEditingAll">,
  ref: React.ForwardedRef<ClientRFQPOPreviewHandle>,
) {
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));
  const commentPopupRef = useRef<any>();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hoveredRow, setHoveredRow] = React.useState<number | null>(null);
  const [dialogState, setDialogState] = useState<OpenDialogItemState>({
    open: false,
    item: null,
  });
  const { localizationValue } = useOrganizationLocalization();
  const {
    addComments,
    structuredRfqComments,
    setStructuredRfqComments,
    setRfqComments,
    RfqComments,
  } = useRfqCommentsData();
  const [currency, setCurrency] = useState<string>(defaultCurrency as any);
  const [editingRate, setEditingRate] = useState<string | null>(null);
  const [rateValue, setRateValue] = useState<string>("");
  const [updatingRate, setUpdatingRate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string>("");
  const [editedRatesById, setEditedRatesById] = useState<
    Record<string, string>
  >({});
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Business Info");
  const tabs = ["Business Info", "Billed To", "Ship To"];

  useEffect(() => {
    if (isEditingAll) {
      const init: Record<string, string> = {};
      data?.vendorRfqLineItems?.forEach((item) => {
        init[item.vendorRfqLineItemId] = String(
          item.vendorRfqLineItemRate ?? 0,
        );
      });
      setEditedRatesById(init);
    } else {
      setEditedRatesById({});
    }
  }, [isEditingAll, data?.vendorRfqLineItems]);

  const { t } = useTranslation();
  const { VITE_PROCUREMENT_ENDPOINT } = useEnv();
  const { post: updateVendorPrice } = useAxiosWithAuth(
    `${VITE_PROCUREMENT_ENDPOINT}/session`,
  );
  const { organizationId } = useOrganization();

  useEffect(() => {
    if (localizationValue) {
      const curr =
        getLocalizationValue(localizationValue, "CURRENCY", "SYMBOL") ?? "";
      if (curr) {
        setCurrency(curr);
      }
    }
  }, [localizationValue]);

  const handleRateEdit = (itemId: string, currentRate: number) => {
    if (updatingRate) return; // Prevent editing while updating
    setEditingRate(itemId);
    setRateValue(currentRate.toString());
  };

  const formatCurrency = (val: number) =>
    formatClientRfqCurrency(localizationValue, val);

  const saveAllRates = async () => {
    if (!isEditingAll || !data?.vendorRfqLineItems) return;
    try {
      setUpdatingRate(true);

      const vendorRfqLineItems = data.vendorRfqLineItems.map((item) => {
        const rateNum = Number(
          editedRatesById[item.vendorRfqLineItemId] ??
            item.vendorRfqLineItemRate ??
            0,
        );
        return {
          vendorRfqLineItemId: item.vendorRfqLineItemId,
          vendorRfqLineItemRate: rateNum,
          vendorRfqLineItemTotal:
            rateNum * Number(item.vendorRfqLineItemQuantity),
        };
      });

      const calculatedTotalAmount = vendorRfqLineItems.reduce(
        (sum, it) => sum + (it.vendorRfqLineItemTotal || 0),
        0,
      );

      const updatePayload = {
        eventType: "UPDATE_VENDOR_PRICE",
        vendorRfqId: data?.vendorRfqId,
        projectId: data?.rfq.projectId,
        projectName: data?.rfq?.projectName,
        organizationId: organizationId,
        organizationType: "AEC",
        rfqName: data?.rfq?.rfqName,
        vendorRfqLineItems,
        senderId: data?.senderId,
        senderType: "AEC",
        totalAmount: calculatedTotalAmount,
        vendorNotes: null,
        receiverName: data?.receiverName,
      };

      await updateVendorPrice(updatePayload);
    } catch (error: any) {
      toast.error(error.message);
      setUpdateMessage("Failed to update prices");
    } finally {
      setUpdatingRate(false);
    }
  };

  React.useImperativeHandle(ref, () => ({
    saveAllRates,
  }));

  const totals = React.useMemo(() => {
    return calcClientRfqTotals(data?.vendorRfqLineItems || [], {
      isEditingAll: Boolean(isEditingAll),
      editingRate,
      rateValue,
      editedRatesById,
    });
  }, [
    data?.vendorRfqLineItems,
    isEditingAll,
    editingRate,
    rateValue,
    editedRatesById,
  ]);

  const handleDialogOpen = (item: VendorRfqLineItem) => {
    setDialogState({ open: true, item });
  };

  const handleDialogClose = () => {
    setDialogState({ open: false, item: null });
  };

  const getProjectId = router?.query?.projectId ?? "";

  return {
    loading,
    setLoading,
    theme,
    isMobile,
    isTablet,
    commentPopupRef,
    router,
    anchorEl,
    setAnchorEl,
    hoveredRow,
    setHoveredRow,
    dialogState,
    localizationValue,
    addComments,
    structuredRfqComments,
    setStructuredRfqComments,
    setRfqComments,
    RfqComments,
    currency,
    editingRate,
    rateValue,
    setRateValue,
    updatingRate,
    updateMessage,
    editedRatesById,
    setEditedRatesById,
    open,
    setOpen,
    activeTab,
    setActiveTab,
    tabs,
    t,
    handleRateEdit,
    formatCurrency,
    saveAllRates,
    totals,
    handleDialogOpen,
    handleDialogClose,
    getProjectId,
  };
}
