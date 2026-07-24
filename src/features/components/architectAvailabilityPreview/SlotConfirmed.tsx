import ThankYouIcon from "@/assets/icons/thank-you-icon";
import { Box, Button, Card, Typography } from "@mui/material";
import AvailabilityPreviewFooter from "./AvailabilityPreviewFooter";
import { Bell } from "lucide-react";
import { useEnv } from "@/features/hooks/useEnv";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../LanguageSwitcher";

const SlotConfirmed = (props: { organizationDetails: any }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { NEXT_PUBLIC_INTOAEC_LOGO } = useEnv();
  const redirect = router.query.redirect;
  const organizationName =
    props?.organizationDetails?.organizationName || "intoAEC";
  const emailId = props?.organizationDetails?.emailId || "team@intoaec.com";
  const mobileNumber =
    props?.organizationDetails?.mobileNumber || "+91 96556 27772";

  return (
    <Box
      sx={{
        background:
          "linear-gradient(90deg, #f8fbff 0%, #ffffff 42%, #eef6ff 100%)",
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          flex: "0 0 auto",
          justifyContent: "space-between",
          px: { xs: 2, sm: 4, md: 6 },
          py: { xs: 1.5, md: 2 },
        }}
      >
        <Box
          component="img"
          src={NEXT_PUBLIC_INTOAEC_LOGO || "/images/logo.png"}
          alt="intoAEC"
          sx={{ height: { xs: 26, md: 34 }, objectFit: "contain" }}
        />
        <Box sx={{ alignItems: "center", display: "flex", gap: 1 }}>
          {redirect && redirect !== "" && (
            <Button
              onClick={() => {
                router.push(redirect as string);
              }}
              size="small"
              variant="contained"
            >
              {t("common.backToPortal")}
            </Button>
          )}
          <LanguageSwitcher />
        </Box>
      </Box>

      <Box
        sx={{
          alignItems: "center",
          display: "grid",
          flex: "1 1 auto",
          gap: { xs: 2, md: 5 },
          gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" },
          minHeight: 0,
          px: { xs: 2, sm: 4, md: 6 },
          py: { xs: 1, md: 0 },
        }}
      >
        <Box sx={{ maxWidth: 560, textAlign: "left" }}>
          <Typography
            component="h1"
            sx={{
              color: "#101935",
              fontSize: { xs: 30, sm: 36, md: 42 },
              fontWeight: 500,
              letterSpacing: 0,
              lineHeight: 1,
              mb: { xs: 1, md: 1.25 },
            }}
          >
            {t("architectSlotBooking.thankYouTitle", {
              defaultValue: "Thank You!",
            })}
          </Typography>

          <Typography
            sx={{
              color: "#111827",
              fontSize: { xs: 20, sm: 24, md: 28 },
              fontWeight: 500,
              letterSpacing: 0,
              lineHeight: 1.15,
              mb: { xs: 1.5, md: 2 },
            }}
          >
            {t("architectSlotBooking.meetingHasBeen", {
              defaultValue: "Your meeting has been",
            })}{" "}
            <Box
              component="span"
              sx={{
                background:
                  "linear-gradient(90deg, #7c3aed 0%, #2563eb 55%, #06b6d4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t("architectSlotBooking.scheduled", {
                defaultValue: "scheduled.",
              })}
            </Box>
          </Typography>

          <Typography
            sx={{
              color: "#667085",
              fontSize: { xs: 14, md: 16 },
              lineHeight: 1.45,
              mb: { xs: 2, md: 2.5 },
            }}
          >
            {t("architectSlotBooking.thankYouMessage", {
              defaultValue:
                "We appreciate you choosing {{organizationName}}. Our team looks forward to collaborating with you on your project.",
              organizationName,
            })}
          </Typography>

          <Card
            sx={{
              alignItems: "center",
              borderRadius: "8px",
              boxShadow: "0 16px 40px rgba(16, 24, 40, 0.08)",
              display: "flex",
              gap: 1.5,
              maxWidth: 560,
              p: { xs: 1.5, md: 2 },
            }}
          >
            <Box
              sx={{
                alignItems: "center",
                bgcolor: "primary.light",
                borderRadius: "50%",
                color: "primary.main",
                display: "flex",
                flex: "0 0 auto",
                height: { xs: 42, md: 48 },
                justifyContent: "center",
                width: { xs: 42, md: 48 },
              }}
            >
              <Bell size={22} />
            </Box>
            <Box>
              <Typography sx={{ color: "#111827", fontWeight: 700, mb: 0.5 }}>
                {t("common.importantNote")}
              </Typography>
              <Typography
                sx={{ color: "#4b5563", fontSize: 13, lineHeight: 1.45 }}
              >
                {t("architectSlotBooking.rescheduleOrCancelMessage", {
                  defaultValue:
                    "If you need to reschedule or cancel the meeting, please contact us at",
                })}{" "}
                <a href={`mailto:${emailId}`} target="_blank" rel="noreferrer">
                  {emailId}
                </a>
                {" | "}
                <a
                  href={`tel:${mobileNumber}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {mobileNumber}
                </a>
              </Typography>
            </Box>
          </Card>
        </Box>

        <Box
          sx={{
            alignItems: "center",
            display: { xs: "none", sm: "flex" },
            justifyContent: "center",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <ThankYouIcon width={"min(42vw, 600px)"} />
        </Box>
      </Box>

      <Box sx={{ flex: "0 0 auto", px: { xs: 2, sm: 4, md: 6 } }}>
        <Box
          sx={{
            "& > .MuiBox-root": {
              minHeight: { xs: 46, md: 56 },
            },
          }}
        >
          <AvailabilityPreviewFooter />
        </Box>
      </Box>
    </Box>
  );
};

export default SlotConfirmed;
