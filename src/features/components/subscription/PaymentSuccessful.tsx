import PaymentSuccessTickIcon from "@/assets/icons/payment-success-tick";
import PaymentSuccessVector from "@/assets/icons/payment-success-vector";
import { Box, Button, Card, useTheme } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

const PaymentSuccessfulPage = () => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // On mount: invalidate the subscription cache so that when the user
  // navigates back to the portal the SubscriptionProvider fetches
  // up-to-date data instead of serving stale cached data.
  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ["organizationSubscriptionDetails"],
    });
  }, []);

  return (
    <Box
      className="d-flex column justify-content-center align-items-center text-center"
      style={{
        backgroundImage: 'url("/images/payment-success-bg.svg")',
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed", // Keeps background fixed
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card
        sx={{
          width: { xs: "80%", sm: "80%", md: "50%", lg: "40%" },
          maxWidth: "400px",
          height: "auto",
          padding: "20px",
        }}
      >
        <Box>
          <img
            width={150}
            src="https://intoaec-qa-core.s3.ap-south-1.amazonaws.com/intoAECLogo.jpeg"
            alt={t("common.companyLogo")}
          />
          <Box>
            <PaymentSuccessVector width="350px" />
          </Box>
          <Box sx={{ width: "100%", mb: 3, mt: 3 }}>
            <PaymentSuccessTickIcon width="60px" />
          </Box>
          <Box>
            {t("payment.successMessage")}
            <p style={{ fontSize: "12px" }}>
              <span style={{ color: theme?.palette?.error?.main }}>
                {t("common.note")}:
              </span>{" "}
              {t("payment.receiptSentToEmail")}
            </p>
          </Box>
          <Button
            variant="contained"
            onClick={() => router.push("/dashboard")}
            sx={{
              height: "36px",
              backgroundColor: "#3CA2FF",
              ":hover": {
                backgroundColor: "#3CA2FF",
              },
            }}
          >
            {t("common.backToPortal")}
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default PaymentSuccessfulPage;
