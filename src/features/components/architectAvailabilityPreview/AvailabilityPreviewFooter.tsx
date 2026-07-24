import FacebookIcon from "@/assets/icons/facebook-icon";
import InstagramIcon from "@/assets/icons/instagram-icon";
import LinkedInIcon from "@/assets/icons/linkedIn-icon";
import TwitterIcon from "@/assets/icons/twitter-icon";
import { Box, IconButton, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useOrganization } from "../providers/OrganizationThemeProvider";

const AvailabilityPreviewFooter = () => {
  const { facebook, twitter, linkedIn, instagram } = useOrganization();
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        alignItems: "center",
        display: "flex",
        flexWrap: "wrap",
        gap: 1,
        justifyContent: {
          xs: "center",
          md: "space-between",
        },
        minHeight: 72,
      }}
    >
      <Typography
        sx={{
          color: "text.secondary",
          fontSize: "11px",
          textAlign: {
            xs: "center",
            md: "start",
          },
          width: {
            xs: "100%",
            md: "auto",
          },
        }}
      >
        {"\u00A9"} 2026 {t("common.copyright")}
      </Typography>
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          gap: 1,
          justifyContent: {
            xs: "center",
            md: "flex-end",
          },
          width: {
            xs: "100%",
            md: "auto",
          },
        }}
      >
        <Typography sx={{ color: "text.secondary", fontSize: "11px" }}>
          {t("questionnaire.questionnaireContactCard.followUsOn")}
        </Typography>
        <Box sx={{ display: "flex" }}>
          <IconButton href={facebook as string} target="blank">
            <FacebookIcon width={"20px"} />
          </IconButton>
          <IconButton href={twitter as string} target="blank">
            <TwitterIcon width={"18px"} />
          </IconButton>
          <IconButton href={linkedIn as string} target="blank">
            <LinkedInIcon width={"20px"} />
          </IconButton>
          <IconButton href={instagram as string} target="blank">
            <InstagramIcon width={"20px"} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default AvailabilityPreviewFooter;
