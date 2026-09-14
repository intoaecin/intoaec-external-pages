import { Box, Paper, Stack, Typography } from "@mui/material";
import { CircleCheck, Clock3 } from "lucide-react";
import { useTranslation } from "react-i18next";

export const QuestionnaireStatus = ({ status }: { status: "expired" | "submitted" }) => {
  const { t } = useTranslation();
  const isExpired = status === "expired";
  return (
    <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center", p: 3, bgcolor: "background.default" }}>
      <Paper elevation={2} sx={{ width: "100%", maxWidth: 560, p: { xs: 3, sm: 5 } }}>
        <Stack spacing={2} alignItems="center" textAlign="center">
          {isExpired ? <Clock3 size={56} /> : <CircleCheck size={56} />}
          <Typography variant="body1" fontWeight={500}>{t(isExpired ? "questionnaire.linkExpiredTitle" : "questionnaire.alreadySubmittedTitle")}</Typography>
          <Typography variant="body2" color="text.secondary">{t(isExpired ? "questionnaire.linkExpiredDescription" : "questionnaire.alreadySubmittedDescription")}</Typography>
        </Stack>
      </Paper>
    </Box>
  );
};
