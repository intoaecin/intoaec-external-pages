import React from "react";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import ViewCommentIcon from "@/assets/icons/view-comment-icon";
import InfoIconExternalPage from "@/assets/icons/info-icon-external-page";
import {
  formatNumberITL,
  getLocalizationValue,
} from "@/lib/helpers";
import type { VendorRfqLineItem } from "./clientRfqPreviewTypes";

export function ClientRFQMobileItemActions(props: {
  item: VendorRfqLineItem;
  index: number;
  isMobile: boolean;
  commentMode?: boolean;
  isEditingAll?: boolean;
  editingRate: string | null;
  rateValue: string;
  setRateValue: (v: string) => void;
  editedRatesById: Record<string, string>;
  setEditedRatesById: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  updatingRate: boolean;
  hoveredRow: number | null;
  commentPopupRef: React.MutableRefObject<any>;
  handleDialogOpen: (item: VendorRfqLineItem) => void;
  localizationValue: any;
  formatCurrency: (val: number) => any;
  handleRateEdit: (itemId: string, currentRate: number) => void;
  t: (key: string) => string;
}) {
  const {
    item,
    index,
    isMobile,
    commentMode,
    isEditingAll,
    editingRate,
    rateValue,
    setRateValue,
    editedRatesById,
    setEditedRatesById,
    updatingRate,
    hoveredRow,
    commentPopupRef,
    handleDialogOpen,
    localizationValue,
    formatCurrency,
    handleRateEdit,
    t,
  } = props;
  return (
    <>
                              <Box textAlign="right">
                                <Typography
                                  onClick={() => handleDialogOpen(item)}
                                  color="#3CA2EF"
                                >
                                  <InfoIconExternalPage
                                    width={16}
                                    height={16}
                                  />
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontSize: 12, lineHeight: 1 }}
                                >
                                  {t("common.rate")}/{t("common.qty")}
                                </Typography>

                                {/* 🔸 Rate Input / Display */}
                                {isEditingAll ? (
                                  <Box
                                    sx={{
                                      mt: 0.8,
                                      display: "flex",
                                      justifyContent: "flex-end",
                                    }}
                                  >
                                    <TextField
                                      size="small"
                                      type="text"
                                      value={
                                        editedRatesById[
                                        item.vendorRfqLineItemId
                                        ] ?? ""
                                      }
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
                                          setEditedRatesById((prev: any) => ({
                                            ...prev,
                                            [item.vendorRfqLineItemId]: value,
                                          }));
                                        }
                                      }}
                                      onKeyDown={(e) => {
                                        const target = e.target as HTMLInputElement;
                                        if (e.key === "-" || (e.key === "." && target.value.includes("."))) {
                                          e.preventDefault();
                                        }
                                      }}
                                      sx={{
                                        width: isMobile ? "60px" : "80px",
                                        "& .MuiInputBase-root": {
                                          height: isMobile ? 28 : 32,
                                        },
                                      }}
                                      inputProps={{
                                        min: 0,
                                        style: {
                                          textAlign: "center",
                                          fontSize: isMobile
                                            ? "0.75rem"
                                            : "0.875rem",
                                        },
                                      }}
                                    />
                                  </Box>
                                ) : (
                                  <Box
                                    sx={{
                                      opacity: updatingRate ? 0.6 : 1,
                                      cursor: "pointer",
                                    }}
                                    onClick={() =>
                                      !updatingRate &&
                                      handleRateEdit(
                                        item?.vendorRfqLineItemId,
                                        item?.vendorRfqLineItemRate ?? 0
                                      )
                                    }
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 600,
                                        fontSize: 14,
                                        color: "text.primary",
                                        mt: 0.3,
                                      }}
                                    >
                                      {localizationValue
                                        ? getLocalizationValue(
                                          localizationValue,
                                          "CURRENCY",
                                          "SYMBOL"
                                        ) +
                                        "" +
                                        formatNumberITL(
                                          localizationValue,
                                          item?.vendorRfqLineItemRate ?? 0
                                        )
                                        : item?.vendorRfqLineItemRate ?? 0}
                                    </Typography>
                                  </Box>
                                )}

                                {/* 🔹 Comment Icon (like in table version) */}
                                {commentMode && hoveredRow === index && (
                                  <IconButton
                                    color="primary"
                                    size={isMobile ? "small" : "medium"}
                                    sx={{
                                      mt: 0.5,
                                      ml: "auto",
                                    }}
                                    onClick={(e) =>
                                      commentPopupRef?.current?.handleOpen(
                                        e.currentTarget,
                                        item?.vendorRfqLineItemId
                                      )
                                    }
                                  >
                                    <ViewCommentIcon
                                      style={{
                                        width: isMobile ? "20px" : "25px",
                                      }}
                                    />
                                  </IconButton>
                                )}
                              </Box>
    </>
  );
}
