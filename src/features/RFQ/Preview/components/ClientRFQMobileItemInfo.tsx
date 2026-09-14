import React from "react";
import { Box, Dialog, DialogContent, Typography } from "@mui/material";
import { TruncatedText } from "@/components_v2/TruncatedText";
import {
  formatNumberITL,
  getLocalizationValue,
} from "@/lib/helpers";
import type {
  OpenDialogItemState,
  VendorRfqLineItem,
} from "./clientRfqPreviewTypes";
import {
  getLocalizedUnitLabel,
  type UnitTranslationFunction,
} from "@/lib/unitLocalization";

export function ClientRFQMobileItemInfo(props: {
  item: VendorRfqLineItem;
  isMobile: boolean;
  dialogState: OpenDialogItemState;
  handleDialogClose: () => void;
  localizationValue: any;
  formatCurrency: (val: number) => any;
  t: UnitTranslationFunction;
  isEditingAll?: boolean;
  editingRate: string | null;
  rateValue: string;
  editedRatesById: Record<string, string>;
}) {
  const {
    item,
    isMobile,
    dialogState,
    handleDialogClose,
    localizationValue,
    formatCurrency,
    t,
    isEditingAll,
    editingRate,
    rateValue,
    editedRatesById,
  } = props;
  return (
    <>
                              <Box
                                display="flex"
                                alignItems="flex-start"
                                gap={1}
                              >
                                <Box>
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    sx={{ minWidth: 0 }} // ✅ allows inner flex children to shrink
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 600,
                                        color: "text.primary",
                                        fontSize: 14,
                                        flex: 1,
                                        minWidth: 0,
                                        maxWidth: "80px",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "normal",
                                        lineHeight: 1.3,
                                      }}
                                    >
                                      {item?.vendorRfqLineItemName || "-"}
                                    </Typography>
                                    <Dialog
                                      open={dialogState.open}
                                      onClose={handleDialogClose}
                                      maxWidth="xs"
                                      fullWidth
                                      hideBackdrop
                                      disableScrollLock
                                      PaperProps={{
                                        sx: {
                                          border: 1 + "px solid #e0e0e0",
                                          boxShadow: 0,
                                          borderRadius: 2,
                                        },
                                      }}
                                    >
                                      {dialogState.item && (
                                        <DialogContent>
                                          <Typography
                                            className="mb-2"
                                            variant="body1"
                                            sx={{
                                              color: "text.secondary",
                                              whiteSpace: "pre-wrap",
                                            }}
                                          >
                                            <strong>{t("common.title")}</strong>
                                            :{" "}
                                            {
                                              dialogState.item
                                                .vendorRfqLineItemName
                                            }
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              color: "text.secondary",
                                              whiteSpace: "pre-wrap",
                                            }}
                                          >
                                            <strong>
                                              {t("common.description")}
                                            </strong>
                                            :{" "}
                                            {dialogState.item
                                              .vendorRfqLineItemDescription ||
                                              "No description available."}
                                          </Typography>
                                        </DialogContent>
                                      )}
                                    </Dialog>
                                  </Box>

                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    mt={0.3}
                                  >
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ fontSize: 13, mr: 1.5 }}
                                    >
                                      {t("common.quantity")}:{" "}
                                      <Box
                                        component="span"
                                        sx={{
                                          color: "text.primary",
                                          fontWeight: 500,
                                        }}
                                      >
                                        {item?.vendorRfqLineItemQuantity ?? 0}
                                      </Box>
                                    </Typography>

                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ fontSize: 13 }}
                                    >
                                      {t("common.unit")}:{" "}
                                      <Box
                                        component="span"
                                        sx={{
                                          color: "text.primary",
                                          fontWeight: 500,
                                        }}
                                      >
                                        {getLocalizedUnitLabel(
                                          item?.vendorRfqLineItemUnit,
                                          t,
                                        ) || "-"}
                                      </Box>
                                    </Typography>
                                  </Box>
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    mt={0.3}
                                  >
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ fontSize: 13, mt: 0.5 }}
                                    >
                                      {t("common.total")}:{" "}
                                      <Box
                                        component="span"
                                        sx={{
                                          color: "text.primary",
                                          fontWeight: 600,
                                        }}
                                      >
                                        {(() => {
                                          if (isEditingAll) {
                                            const rateNum = Number(
                                              editedRatesById[
                                              item.vendorRfqLineItemId
                                              ] ??
                                              item?.vendorRfqLineItemRate ??
                                              0
                                            );
                                            const total =
                                              rateNum *
                                              Number(
                                                item?.vendorRfqLineItemQuantity
                                              );
                                            return localizationValue
                                              ? getLocalizationValue(
                                                localizationValue,
                                                "CURRENCY",
                                                "SYMBOL"
                                              ) +
                                              "" +
                                              formatNumberITL(
                                                localizationValue,
                                                total
                                              )
                                              : total;
                                          }
                                          if (
                                            editingRate ===
                                            item?.vendorRfqLineItemId
                                          ) {
                                            const total =
                                              Number(rateValue) *
                                              Number(
                                                item?.vendorRfqLineItemQuantity
                                              );
                                            return localizationValue
                                              ? getLocalizationValue(
                                                localizationValue,
                                                "CURRENCY",
                                                "SYMBOL"
                                              ) +
                                              "" +
                                              formatNumberITL(
                                                localizationValue,
                                                total
                                              )
                                              : total;
                                          }
                                          return localizationValue
                                            ? getLocalizationValue(
                                              localizationValue,
                                              "CURRENCY",
                                              "SYMBOL"
                                            ) +
                                            "" +
                                            formatNumberITL(
                                              localizationValue,
                                              item?.vendorRfqLineItemTotal ??
                                              0
                                            )
                                            : item?.vendorRfqLineItemTotal ?? 0;
                                        })()}
                                      </Box>
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
    </>
  );
}
