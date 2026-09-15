"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  AccountCircle as AccountCircleIcon,
} from "@mui/icons-material";
import { useEnv } from "@/features/hooks/useEnv";
import { useAxios } from "@/features/hooks/useAxios";
import { useTranslation } from "react-i18next";

const ClientAndBilledToInformation = ({ externalData }: any) => {
  const [clientInfo, setClientInfo] = useState<any>();
  const [billedToInfo, setBilledToInfo] = useState<any>();
  const { t } = useTranslation();
  const { NEXT_PUBLIC_USERHUB_ENDPOINT } = useEnv();
  const { post: fetchOrganization } = useAxios(
    `${NEXT_PUBLIC_USERHUB_ENDPOINT}/organization`,
    true
  );

  const fetchReceiverOrganizationDetails = async (organizationId: string) => {
    try {
      const response = await fetchOrganization({
        eventType: "GET_ORGANIZATION_ADDRESS_INFO",
        organizationId: organizationId,
      });
      if (response?.code === "ORGANIZATION_DETAILS_RETRIEVED") {
        const body = response.body || {};
        setBilledToInfo({
          organizationName: body.organizationName || body.organizationId || "",
          mobileNumber: body.superAdmin?.mobile || "",
          emailId: body.superAdmin?.email || "",
          addressLine1: body.addressLine1 || "",
          addressLine2: body.addressLine2 || "",
          city: body.city || "",
          state: body.state || "",
          country: body.country || "",
          zipCode: body.zipCode || "",
          organizationLocation: body.city || "",
        });
      }
    } catch (error) {
      console.log("Error fetching organization details:", error);
    }
  };

  useEffect(() => {
    setBilledToInfo({
      organizationName: externalData?.organizationName,
      mobileNumber: externalData?.mobileNumber,
      emailId: externalData?.emailId,
      addressLine1: externalData?.addressLine1,
      addressLine2: externalData?.addressLine2,
      city: externalData?.city,
      state: externalData?.state,
      country: externalData?.country,
      zipCode: externalData?.zipCode,
      organizationLocation: externalData?.organizationLocation,
      accountNumber: externalData?.accountNumber
    });
  }, [externalData]);

  useEffect(() => {
    setClientInfo({
      fullName: externalData?.customerName,
      email: externalData?.emailId,
      mobileNumber: externalData?.mobileNumber,
      organizationName: externalData?.organizationName,
      accountId: externalData?.accountNumber,
    });
    if (externalData?.organizationId) {
      fetchReceiverOrganizationDetails(externalData.organizationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalData]);

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <PersonIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            {t("checkout.clientInformation")}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Full Name */}
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <PersonIcon color="primary" fontSize="small" />
              <Box flex={1}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="600"
                  sx={{ textTransform: "uppercase", display: "block" }}
                >
                  {t("checkout.fullName")}
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {clientInfo?.fullName || "-"}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Email */}
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <EmailIcon color="primary" fontSize="small" />
              <Box flex={1}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="600"
                  sx={{ textTransform: "uppercase", display: "block" }}
                >
                  {t("common.emailAddress")}
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {clientInfo?.email || "-"}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Mobile Number */}
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <PhoneIcon color="primary" fontSize="small" />
              <Box flex={1}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="600"
                  sx={{ textTransform: "uppercase", display: "block" }}
                >
                  {t("common.mobileNumber")}
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {clientInfo?.mobileNumber || "-"}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Organization Name */}
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <BusinessIcon color="primary" fontSize="small" />
              <Box flex={1}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="600"
                  sx={{ textTransform: "uppercase", display: "block" }}
                >
                  {t("common.organizationName")}
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {clientInfo?.organizationName || "-"}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Address */}
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <LocationOnIcon color="primary" fontSize="small" />
              <Box flex={1}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="600"
                  sx={{ textTransform: "uppercase", display: "block" }}
                >
                  {t("common.address")}
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {billedToInfo?.addressLine1 ? (
                    <>
                      {billedToInfo.addressLine1}
                      {billedToInfo.addressLine2 ? `, ${billedToInfo.addressLine2}` : ""}
                      {billedToInfo.city ? `, ${billedToInfo.city}` : ""}
                      {billedToInfo.state ? `, ${billedToInfo.state}` : ""}
                      {billedToInfo.country ? `, ${billedToInfo.country}` : ""}
                      {billedToInfo.zipCode ? ` - ${billedToInfo.zipCode}` : ""}
                    </>
                  ) : (
                    "-"
                  )}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Account ID */}
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <AccountCircleIcon color="primary" fontSize="small" />
              <Box flex={1}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="600"
                  sx={{ textTransform: "uppercase", display: "block" }}
                >
                  {t("checkout.accountId")}
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {clientInfo?.accountId || "-"}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ClientAndBilledToInformation;
