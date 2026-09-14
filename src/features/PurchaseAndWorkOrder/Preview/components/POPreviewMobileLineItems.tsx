import React from "react";
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";
import ViewCommentIcon from "@/assets/icons/view-comment-icon";
import InfoIconExternalPage from "@/assets/icons/info-icon-external-page";
import {
  formatNumberITL,
  getLocalizationValue,
} from "@/lib/helpers";
import { TruncatedText } from "@/components_v2/TruncatedText";
import type { OpenDialogItemState } from "./poPreviewUtils";

export type POPreviewMobileLineItemsProps = {
  data: any;
  isMobile: boolean;
  localizationValue: any;
  t: (key: string) => string;
  commentMode?: boolean;
  hoveredRow: number | null;
  setHoveredRow: (v: number | null) => void;
  commentPopupRef: React.MutableRefObject<any>;
  dialogState: OpenDialogItemState;
  handleDialogOpen: (item: any) => void;
  handleDialogClose: () => void;
};

export function POPreviewMobileLineItems(
  props: POPreviewMobileLineItemsProps,
) {
  const {
    data,
    isMobile,
    localizationValue,
    t,
    commentMode,
    hoveredRow,
    setHoveredRow,
    commentPopupRef,
    dialogState,
    handleDialogOpen,
    handleDialogClose,
  } = props;
  if (!isMobile) return null;
  return (
              <Box>
                {data?.poLineItems?.map((item: any, index: number) => (
                  <Box
                    key={item?.poliId}
                    sx={{
                      mb: 1.5,
                      width: "100%",
                      boxShadow: 1,
                      borderRadius: "6px",
                      bgcolor: hoveredRow === index ? "#E3F2FD" : "#F9F9FA",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={() => setHoveredRow(index)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <Box
                      sx={{
                        py: 1,
                        px: 1.8,
                        "&:last-child": { pb: 1.2 },
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                      >
                        {/* 🔹 Left section: image, title, quantity, unit, total */}
                        <Box display="flex" alignItems="flex-start" gap={1.2}>
                          <Box>
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
                              {item?.poItemName ?? "-"}
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
                                    <strong>{t("common.title")}</strong>:{" "}
                                    <TruncatedText text={dialogState.item.poItemName} limit={25} />
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: "text.secondary",
                                      whiteSpace: "pre-wrap",
                                    }}
                                  >
                                    <strong>{t("common.description")}</strong>:{" "}
                                    {dialogState.item.poItemDescription ||
                                      "No description available."}
                                  </Typography>
                                </DialogContent>
                              )}
                            </Dialog>
                            <Box
                              display="flex"
                              flexWrap="wrap"
                              mt={0.5}
                              gap={1}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: 13 }}
                              >
                                {t("common.quantity")}:{" "}
                                <Box
                                  component="span"
                                  sx={{
                                    color: "text.primary",
                                    fontWeight: 500,
                                  }}
                                >
                                  {item?.poItemQuantity ?? 0}
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
                                  {item?.poItemUnit ??
                                    item?.itemUnitFromEstimate ??
                                    "-"}
                                </Box>
                              </Typography>
                            </Box>

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
                                {localizationValue
                                  ? getLocalizationValue(
                                    localizationValue,
                                    "CURRENCY",
                                    "SYMBOL"
                                  ) +
                                  "" +
                                  formatNumberITL(
                                    localizationValue,
                                    item?.poItemTotal ?? 0
                                  )
                                  : item?.poItemTotal ?? 0}
                              </Box>
                            </Typography>
                          </Box>
                        </Box>

                        {/* 🔹 Right section: rate and comment icon */}
                        <Box textAlign="right" sx={{ minWidth: "70px" }}>
                          <Typography
                            onClick={() => handleDialogOpen(item)}
                            color="#3CA2EF"
                          >
                            <InfoIconExternalPage width={16} height={16} />
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: 12 }}
                          >
                            {t("common.rate")}
                          </Typography>
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
                                item?.poItemRate ?? 0
                              )
                              : item?.poItemRate ?? 0}
                          </Typography>

                          {commentMode && hoveredRow === index && (
                            <IconButton
                              color="primary"
                              size="small"
                              sx={{ mt: 0.5 }}
                              onClick={(e) =>
                                commentPopupRef?.current?.handleOpen(
                                  e.currentTarget,
                                  item?.poliId
                                )
                              }
                            >
                              <ViewCommentIcon style={{ width: "20px" }} />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>

  );
}
