import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import { useRfqCommentsData } from "../providers/RfqProvider/RfqSuggestionProvider";
import { useTranslation } from "react-i18next";

const RfqCommentHeader = ({
  setCommentMode,
  rfqTitle,
  onCommentsSaved,
}: //   estimateData

{
  //   estimateData: any;
  setCommentMode?: React.Dispatch<React.SetStateAction<boolean>>;
  rfqTitle: string;
  onCommentsSaved?: () => void | Promise<void>;
}) => {
  const { saveComments } = useRfqCommentsData();
  const { t } = useTranslation();

  const handleSaveComments = async () => {
    if (saveComments) {
      await saveComments();
    }
    if (onCommentsSaved) {
      await onCommentsSaved();
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
        <Typography className="fs-5 fw-600">{t('procurement.rfqTitle')}</Typography>
        <Box className="d-flex">
          <Box className="mr-3 d-flex align-items-center tw-gap-5">
            <Button
              variant="contained"
              //   disabled={
              //     JSON.stringify(initialEstimateComment) ==
              //     JSON.stringify(estimateComments)
              //   }
              onClick={handleSaveComments}
            >
              {t('procurement.saveComments')}
            </Button>
            <Tooltip arrow placement="bottom" title={t('procurement.exitCommentMode')}>
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

export default RfqCommentHeader;
