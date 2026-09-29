import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import { LoadingButton } from "@mui/lab";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";
import { useProposalComments } from "../../providers/ProposalProviders/ProposalSuggestionProvider";
import { useTranslation } from "react-i18next";

export const ProposalCommentModeHeader = ({
  proposalData,
  setCommentMode,
}: {
  proposalData?: any;
  setCommentMode?: Dispatch<SetStateAction<boolean>>;
}) => {
  const { saveComments, controllerComments, intialComments } =
    useProposalComments();
  const { t } = useTranslation();
  const [savingComments, setSavingComments] = useState(false);
  const hasCommentChanges =
    JSON.stringify(intialComments) !== JSON.stringify(controllerComments);

  const handleSaveComments = async () => {
    if (!hasCommentChanges || savingComments) return;

    setSavingComments(true);
    try {
      await saveComments(controllerComments);
    } finally {
      setSavingComments(false);
    }
  };

  return (
    <Box
    className="d-flex justify-content-between align-items-center row py-2 pl-1"
    sx={{
      backgroundColor: "background.paper",
    }}
    >
      <Typography variant="h6">{proposalData?.proposalTitle}</Typography>
      <div className="d-flex">
        <div className="mr-3 d-flex align-items-center tw-gap-5">
          <LoadingButton
            variant="contained"
            disabled={!hasCommentChanges || savingComments}
            loading={savingComments}
            onClick={handleSaveComments}
            sx={{ minWidth: 140 }}
          >
            {t("tooltips.saveComment")}
          </LoadingButton>
          <Tooltip arrow placement="bottom" title={t("tooltips.exitCommentMode")}>

          <IconButton
            onClick={() => {
              setCommentMode?.(false);
            }}
          >
            <ExitToAppRoundedIcon />
          </IconButton>
          </Tooltip>
        </div>
      </div>
    </Box>
  );
};
