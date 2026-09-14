import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import { LoadingButton } from "@mui/lab";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";
import { useEstimateCommentsData } from "../../providers/BoqProvider/BoqSuggestionProvider";
import { useTranslation } from "react-i18next";
const BoqCommentHeader = ({
  setCommentMode,
  estimateTitle,
}: //   estimateData

{
  //   estimateData: any;
  setCommentMode?: Dispatch<SetStateAction<boolean>>;
  estimateTitle: string;
}) => {
  const { initialEstimateComment, estimateComments, saveComments } =
    useEstimateCommentsData();
  const [savingComments, setSavingComments] = useState(false);

  const { t } = useTranslation();
  const hasCommentChanges =
    JSON.stringify(initialEstimateComment) !== JSON.stringify(estimateComments);

  const handleSaveComments = async () => {
    if (!hasCommentChanges || savingComments) return;

    setSavingComments(true);
    try {
      await saveComments(estimateComments);
    } finally {
      setSavingComments(false);
    }
  };

  return (
    <Box
      className="bg-white py-sm-1 py-md-2 py-3 px-sm-2 px-md-3 px-4 position-sticky t-0 l-0 r-0"
      sx={{
        boxShadow: " 4px 4px 10px 0px rgb(0 0 0 / 5%);",
        zIndex: 50,
      }}
    >
      <Box className="d-flex justify-content-between align-items-center flex-wrap gap-1">
        <Typography className="fs-5 fw-600">{estimateTitle}</Typography>
        <Box className="d-flex">
          <Box className="mr-3 d-flex align-items-center tw-gap-5">
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
                  //   toast.success("switched to normal mode");
                }}
              >
                <ExitToAppRoundedIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BoqCommentHeader;
