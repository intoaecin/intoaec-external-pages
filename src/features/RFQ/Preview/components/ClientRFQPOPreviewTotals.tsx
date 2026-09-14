import React from "react";
import { Box, Divider } from "@mui/material";
import PreviewAttachments from "@/components/preview/PreviewAttachment";
import type { CreateRFQPOPreviewProps } from "./clientRfqPreviewTypes";

export function ClientRFQPOPreviewTotals(props: {
  data: CreateRFQPOPreviewProps["data"];
  pdf?: boolean;
  isMobile: boolean;
  isEditingAll?: boolean;
  editingRate: string | null;
  totals: { subtotal: number; total: number };
  formatCurrency: (val: number) => any;
  t: (key: string, opts?: any) => string;
  loading?: boolean;
}) {
  const {
    data,
    pdf,
    isMobile,
    isEditingAll,
    editingRate,
    totals,
    formatCurrency,
    t,
    loading = true,
  } = props;
  return (
    <>
                {/* subtotal  */}
                <Box
                  className={`d-flex row justify-content-end ${isMobile ? "mr-1" : "mr-2"
                    } my-2`}
                >
                  <Box
                    className={`${isMobile ? "col-7" : "col-6"} border rounded`}
                    sx={{ backgroundColor: isMobile ? "#E3F2FF" : "" }}
                  >
                    {(() => {
                      const isEditing = Boolean(isEditingAll || editingRate);
                      const subtotalValue = isEditing
                        ? totals.subtotal
                        : Number(data?.totalAmount) || 0;
                      const totalValue = isEditing
                        ? totals.total
                        : Number(data?.totalAmount) || 0;

                      return (
                        <>
                          {/* Subtotal */}
                          <Box className="d-flex row justify-content-between my-2 px-1">
                            <span className={isMobile ? "fs-7" : ""}>
                              {pdf ? "Subtotal" : t("common.subTotal")}
                            </span>
                            <span
                              className={isMobile ? "fs-7 fw-bold" : "fw-bold"}
                            >
                              {formatCurrency(subtotalValue)}
                            </span>
                          </Box>

                          <Divider />

                          {/* Total */}
                          <Box
                            className="d-flex row justify-content-between my-1 px-1"
                            sx={{
                              backgroundColor: isMobile
                                ? "#E3F2FF"
                                : "transparent",
                            }}
                          >
                            <span
                              className={`fw-600 ${isMobile ? "fs-7" : ""}`}
                            >
                              {isMobile
                                ? pdf
                                  ? "Total"
                                  : t("common.total")
                                : pdf
                                  ? "Total Amount"
                                  : t("common.totalAmount")}
                            </span>
                            <span className={isMobile ? "fs-7" : ""}>
                              {formatCurrency(totalValue)}
                            </span>
                          </Box>
                        </>
                      );
                    })()}
                  </Box>
                </Box>

                <Divider />
                {(data?.attachmentUrls || data?.rfq?.attachmentUrls) && (
                  <PreviewAttachments
                    items={data?.attachmentUrls || data?.rfq?.attachmentUrls}
                    label={t("common.attachments") || "Attachments"}
                    pdf={pdf}
                  />
                )}
                {loading && (data?.rfq?.senderNotes || data?.vendorNotes) && (
                  <Box
                    className={`${isMobile ? "pl-1 py-1 px-1" : "pl-2 py-2"}`}
                  >
                    <Box className="pb-2">
                      <span className={`fw-600 ${isMobile ? "fs-8" : "fs-7"}`}>
                        {pdf ? "Notes" : t("common.notes")}
                      </span>
                    </Box>
                    <Box>
                      {loading ? (
                        <>
                          <span className={isMobile ? "fs-7" : ""}>
                            {data?.rfq?.senderNotes || data?.vendorNotes}
                          </span>
                        </>
                      ) : (
                        <></>
                      )}
                    </Box>
                  </Box>
                )}
    </>
  );
}
