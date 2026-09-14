import React from "react";
import { Box, Divider } from "@mui/material";
import PreviewAttachments from "@/components/preview/PreviewAttachment";
import {
  formatNumberITL,
  getLocalizationValue,
} from "@/lib/helpers";

export type POPreviewTotalsAndAttachmentsProps = {
  data: any;
  pdf?: boolean;
  isMobile: boolean;
  isWorkOrder: boolean;
  localizationValue: any;
  t: (key: string, opts?: any) => string;
  previewAttachmentItems: unknown[];
};

export function POPreviewTotalsAndAttachments(
  props: POPreviewTotalsAndAttachmentsProps,
) {
  const {
    data,
    pdf,
    isMobile,
    isWorkOrder,
    localizationValue,
    t,
    previewAttachmentItems,
  } = props;
  return (
    <>
            {/* subtotal  */}
            <Box
              className={`d-flex row justify-content-end ${isMobile ? "mr-1" : "mr-2"
                } my-2`}
            >
              <div
                className={`${isMobile ? "col-7" : "col-6"} border rounded`}
              // style={{ background: isMobile ? "#E3F2FF" : "#fff" }}
              >
                <div
                  className={`d-flex row justify-content-between my-2 ${isMobile ? "px-1" : "px-1"
                    }`}
                >
                  <span className={isMobile ? "fs-7" : ""}>
                    {pdf ? "Subtotal" : t("common.subTotal")}
                  </span>
                  <span className={isMobile ? "fs-7 font-weight-bold" : ""}>
                    {localizationValue
                      ? getLocalizationValue(
                        localizationValue,
                        "CURRENCY",
                        "SYMBOL"
                      ) +
                      "" +
                      formatNumberITL(
                        localizationValue,
                        data?.poLineItems?.reduce(
                          (secTotal: any, item: any) => {
                            return secTotal + (Number(item.poItemTotal) ?? 0);
                          },
                          0
                        ) ?? 0
                      )
                      : data?.poLineItems?.reduce(
                        (secTotal: any, item: any) => {
                          return secTotal + (Number(item.poItemTotal) ?? 0);
                        },
                        0
                      ) ?? 0}
                  </span>
                </div>
                {/* <div className="d-flex row justify-content-between my-2 px-1">
                  <span>{"Discount"}</span>
                  <span>{"$310.00$0.00 (0%)"}</span>
                </div> */}
                {/* <div className="d-flex row justify-content-between my-2 px-1">
                      <span>{"Total tax"}</span>
                      <span>{data?.rfqTaxAmount ?? 0}</span>
                    </div> */}
                <Divider />
                <div
                  className={`d-flex row justify-content-between my-1 ${isMobile ? "px-1" : "px-1"
                    }`}
                // style={{ background: isMobile ? "#E3F2FF" : "#fff" }}
                >
                  <span className={`fw-600 ${isMobile ? "fs-7" : ""}`}>
                    {isMobile
                      ? pdf
                        ? "Total"
                        : t("common.total")
                      : pdf
                        ? "Total Amount"
                        : t("common.totalAmount")}
                  </span>
                  <span className={isMobile ? "fs-7" : ""}>
                    {localizationValue
                      ? getLocalizationValue(
                        localizationValue,
                        "CURRENCY",
                        "SYMBOL"
                      ) +
                      "" +
                      formatNumberITL(
                        localizationValue,
                        data?.poLineItems?.reduce(
                          (secTotal: any, item: any) => {
                            return secTotal + (Number(item.poItemTotal) ?? 0);
                          },
                          0
                        ) ?? 0
                      )
                      : data?.poLineItems?.reduce(
                        (secTotal: any, item: any) => {
                          return secTotal + (Number(item.poItemTotal) ?? 0);
                        },
                        0
                      ) ?? 0}
                  </span>
                </div>
              </div>
            </Box>

      <Divider />
            {previewAttachmentItems.length > 0 && (
              <PreviewAttachments
                items={previewAttachmentItems}
                label={
                  isWorkOrder
                    ? t("common.scopeOfWork") || "Scope of work"
                    : t("common.attachments") || "Attachments"
                }
                pdf={pdf}
              />
            )}

    </>
  );
}
