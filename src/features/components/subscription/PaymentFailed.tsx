import CloseRoundIcon from "@/assets/icons/close-round-icon";
import PaymentSuccessIcon from "@/assets/icons/payment-success-icon";
import { Box, Button, Card, useTheme } from "@mui/material";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

const PaymentFailed = () => {
  const theme = useTheme();
  const router = useRouter();

  const { t } = useTranslation();
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
            alt="Company Logo"
          />
          <Box>
            <PaymentSuccessIcon width="350px" />
          </Box>
          <Box sx={{ width: "100%", mb: 3, mt: 3 }}>
            <CloseRoundIcon width="60px" />
          </Box>
          <Box>
            Your payment was unsuccessful. Please try again or contact support.
          </Box>
          <Button
            variant="contained"
            onClick={() => router.push("/dashboard")}
            sx={{
              marginTop: "10px",
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

export default PaymentFailed;
