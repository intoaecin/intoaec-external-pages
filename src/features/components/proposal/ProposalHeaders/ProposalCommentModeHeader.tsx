import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
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
          <Button
            variant="contained"
            disabled={
              JSON.stringify(intialComments) ==
              JSON.stringify(controllerComments)
            }
            onClick={() => {
              saveComments(controllerComments);
            }}
          >
            Save Comments
          </Button>
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
