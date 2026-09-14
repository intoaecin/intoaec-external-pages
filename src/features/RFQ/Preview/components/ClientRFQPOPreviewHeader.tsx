import React from "react";
import { Box, Typography } from "@mui/material";
import BusinessAndShippingInfo from "@/features/RFQAndPO/components/BusinessAndShippingInfo";
import MobileBusinessAndShippingInfo from "@/features/RFQAndPO/components/MobileBusinessAndShippingInfo";
import { formatDateBasedOnOrganizationLocalization } from "@/lib/helpers";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import type { CreateRFQPOPreviewProps } from "./clientRfqPreviewTypes";

export function ClientRFQPOPreviewHeader({
  data,
  pdf,
  isMobile,
  localizationValue,
  t,
  tabs,
  activeTab,
  setActiveTab,
  getProjectId,
  shippingDetails,
  defaultOrganizationDetails,
  vendorDetails,
}: {
  data: CreateRFQPOPreviewProps["data"];
  pdf?: boolean;
  isMobile: boolean;
  localizationValue: any;
  t: (key: string) => string;
  tabs: string[];
  activeTab: string;
  setActiveTab: (v: string) => void;
  getProjectId: string | string[];
  shippingDetails?: any;
  defaultOrganizationDetails?: any;
  vendorDetails?: any;
}) {
  const { organizationId } = useOrganization();
  return (
    <>
              <Box
                className="d-flex justify-content-between"
                sx={{ pt: 2, pb: 1, px: isMobile ? 0 : 2 }}
              >
                <Box>
                  <span className={`fw-500 ${isMobile ? "fs-7" : "fs-10"}`}>
                    {data?.rfq?.rfqSerial}
                  </span>
                </Box>
                <Box>
                  <span className={`${isMobile ? "fs-8" : "fs-8"}`}>
                    {pdf ? "Created On" : t("common.createdOn")} :{" "}
                    {formatDateBasedOnOrganizationLocalization(
                      localizationValue,
                      Number(data?.rfq?.createdOn),
                      true
                    )}
                  </span>
                </Box>
              </Box>
              {isMobile && !pdf && (
                <Box>
                  <Box
                    className="d-flex flex-row justify-content-between align-items-center px-1"
                    gap={4}
                    sx={{
                      pb: 1,
                      mt: 2,
                    }}
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
                      isPo={true}
                      projectId={getProjectId.toString()}
                      organizationId={organizationId}
                      withAuth={false}
                      isPreview={true}
                      pdf={pdf}
                      defaultOrganizationDetails={defaultOrganizationDetails}
                      defaultVendorDetails={vendorDetails}
                      defaultShippingDetails={shippingDetails}
                      isTaxDisplay={data?.rfq?.isTaxDisplay ?? true}
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
                    isPo={true}
                    projectId={getProjectId.toString()}
                    organizationId={organizationId}
                    withAuth={false}
                    isPreview={true}
                    pdf={pdf}
                    defaultOrganizationDetails={defaultOrganizationDetails}
                    defaultVendorDetails={vendorDetails}
                    defaultShippingDetails={shippingDetails}
                    isTaxDisplay={data?.rfq?.isTaxDisplay ?? true}
                  />
                </div>
              )}
    </>
  );
}
