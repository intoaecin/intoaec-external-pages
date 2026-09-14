import React from "react";
import { Box, Typography } from "@mui/material";
import BusinessAndShippingInfo from "@/features/RFQAndPO/components/BusinessAndShippingInfo";
import MobileBusinessAndShippingInfo from "@/features/RFQAndPO/components/MobileBusinessAndShippingInfo";
import { formatDateBasedOnOrganizationLocalization } from "@/lib/helpers";

export type POPreviewDocumentHeaderProps = {
  data: any;
  pdf?: boolean;
  isMobile: boolean;
  isWorkOrder: boolean;
  localizationValue: any;
  t: (key: string) => string;
  tabs: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  getProjectId: string | string[];
  organizationId?: string;
  defaultShippingDetails?: any;
  defaultOrganizationDetails?: any;
  vendorDetails?: any;
};

export function POPreviewDocumentHeader({
  data,
  pdf,
  isMobile,
  isWorkOrder,
  localizationValue,
  t,
  tabs,
  activeTab,
  setActiveTab,
  getProjectId,
  organizationId,
  defaultShippingDetails,
  defaultOrganizationDetails,
  vendorDetails,
}: POPreviewDocumentHeaderProps) {
  // The admin app falls back to a `useSession()`-derived organization id when
  // `organizationId` is not supplied. This public client-preview page always
  // passes a concrete `organizationId` (from the fetched PO's `senderId`), so
  // that admin-session fallback branch is unreachable here and was dropped
  // (this app has no session/auth of any kind) — always public (`withAuth=false`).
  return (
    <>
          <Box
            className="d-flex justify-content-between"
            sx={{ pt: 2, pb: 1, px: isMobile ? 0 : 2 }}
          >
            <Box>
              <span className={`fw-500 ${isMobile ? "fs-7" : "fs-10"}`}>
                {data?.poSerial}
              </span>
            </Box>
            <Box sx={{ gap: 1, display: "flex", alignItems: "center" }}>
              <span className={`${isMobile ? "fs-8" : "fs-8"}`}>
                {pdf ? "Issued Date" : t("common.issuedDate")}{": "}
                {formatDateBasedOnOrganizationLocalization(
                  localizationValue,
                  Number(data?.issuedOn),
                  true
                )}
              </span>
              {isWorkOrder && <span className={`${isMobile ? "fs-8" : "fs-8"}`}>
                {pdf ? "Due Date" : t("common.dueDate")}{": "}
                {formatDateBasedOnOrganizationLocalization(
                  localizationValue,
                  Number(data?.dueDate),
                  true
                )}
              </span>}
            </Box>
          </Box>

          {isMobile && !pdf && (
            <Box>
              <Box
                className="d-flex flex-row justify-content-between align-items-center px-1"
                gap={4}
                sx={{ borderBottom: "1px solid #E0E0E0", pb: 1, mt: 2 }}
              >
                {tabs.map((tab) => (
                  <Box
                    key={tab}
                    sx={{
                      position: "relative",
                      cursor: "pointer",
                      pb: 0.5,
                    }}
                    onClick={() => setActiveTab(tab)}
                  >
                    <Typography
                      sx={{
                        fontWeight: activeTab === tab ? 600 : 500,
                        color: activeTab === tab ? "#3CA2EF" : "#666",
                        fontSize: "15px",
                        transition: "color 0.2s ease",
                      }}
                    >
                      {tab}
                    </Typography>
                    {activeTab === tab && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          height: "2px",
                          width: "100%",
                          backgroundColor: "#3CA2EF",
                          borderRadius: "1px",
                        }}
                      />
                    )}
                  </Box>
                ))}
              </Box>
              <Box className="mt-2">
                <MobileBusinessAndShippingInfo
                  isMobile={isMobile}
                  type={"ADMIN"}
                  projectId={getProjectId.toString()}
                  organizationId={organizationId}
                  withAuth={false}
                  isPreview={true}
                  isPo={true}
                  pdf={pdf}
                  defaultShippingDetails={defaultShippingDetails}
                  defaultOrganizationDetails={defaultOrganizationDetails}
                  defaultVendorDetails={vendorDetails}
                  isTaxDisplay={data?.isTaxDisplay ?? true}
                  details={activeTab}
                />
              </Box>
            </Box>
          )}

          {(!isMobile || pdf) && (
            <div>
              <BusinessAndShippingInfo
                isMobile={isMobile}
                type={"ADMIN"}
                projectId={getProjectId.toString()}
                organizationId={organizationId}
                withAuth={false}
                isPreview={true}
                isPo={true}
                pdf={pdf}
                defaultShippingDetails={defaultShippingDetails}
                defaultOrganizationDetails={defaultOrganizationDetails}
                defaultVendorDetails={vendorDetails}
                isTaxDisplay={data?.isTaxDisplay ?? true}
              />
            </div>
          )}

    </>
  );
}
