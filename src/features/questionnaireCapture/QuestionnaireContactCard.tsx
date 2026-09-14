import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { Box, LinearProgress, Stack, Typography } from "@mui/material";
import { Mail, MapPin, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

type Props = { activeStep: number; maxSteps: number; handlePrevStep: () => void; handleNextStep: () => void };

export const LeadQuestionnaireCaptureContactCard = ({ activeStep, maxSteps }: Props) => {
  const { t } = useTranslation();
  const { logoUrl, organizationName, emailId, mobileNumber, addressLine1, addressLine2, facebook, twitter, instagram, linkedIn } = useOrganization();
  const address = [addressLine1, addressLine2].filter(Boolean).join(", ");
  const socialLinks = [
    { label: "Instagram", url: instagram },
    { label: "X", url: twitter },
    { label: "Facebook", url: facebook },
    { label: "LinkedIn", url: linkedIn },
  ].filter((link): link is { label: string; url: string } => Boolean(link.url));
  return (
    <Box sx={{ width: { xs: "100%", md: "27%" }, minHeight: { md: "100dvh" }, bgcolor: "primary.light", p: { xs: 3, md: 4 } }}>
      <Stack spacing={3}>
        {logoUrl && <Box component="img" src={logoUrl} alt={organizationName ?? ""} sx={{ maxWidth: 180, maxHeight: 100, objectFit: "contain" }} />}
        {organizationName && <Typography variant="body1" fontWeight={500}>{organizationName}</Typography>}
        {emailId && <Stack direction="row" spacing={1} alignItems="center"><Mail size={18} /><Typography variant="body2">{emailId}</Typography></Stack>}
        {mobileNumber && <Stack direction="row" spacing={1} alignItems="center"><Phone size={18} /><Typography variant="body2">{mobileNumber}</Typography></Stack>}
        {address && <Stack direction="row" spacing={1} alignItems="center"><MapPin size={18} /><Typography variant="body2">{address}</Typography></Stack>}
        <Box><Typography variant="body2" sx={{ mb: 1 }}>{t("questionnaire.questionnaireContactCard.questions")} {activeStep + 1}/{maxSteps}</Typography><LinearProgress variant="determinate" value={maxSteps ? ((activeStep + 1) / maxSteps) * 100 : 0} /></Box>
        {socialLinks.length > 0 && <Box><Typography variant="body2" sx={{ mb: 1 }}>{t("questionnaire.questionnaireContactCard.followUsOn")}</Typography><Stack direction="row" spacing={2} flexWrap="wrap">{socialLinks.map(({ label, url }) => <Typography key={label} component="a" variant="body2" href={url} target="_blank" rel="noopener noreferrer" sx={{ color: "primary.main" }}>{label}</Typography>)}</Stack></Box>}
      </Stack>
    </Box>
  );
};
