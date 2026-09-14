import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import { usePoCommentsData } from "../providers/RfqProvider/PoSuggestionProvider";
import { useTranslation } from "react-i18next";

const PoCommentHeader = ({
  setCommentMode,
  rfqTitle,
}: //   estimateData

{
  //   estimateData: any;
  setCommentMode?: React.Dispatch<React.SetStateAction<boolean>>;
  rfqTitle: string;
}) => {
  const { saveComments } = usePoCommentsData();

  const { t } = useTranslation();
  return (
    <Box
      className="bg-white py-sm-1 py-md-2 py-3 px-sm-2 px-md-3 px-4 position-sticky t-0 l-0 r-0"
      sx={{
        boxShadow: " 4px 4px 10px 0px rgb(0 0 0 / 5%);",
        zIndex: 50,
      }}
    >
      <Box className="d-flex justify-content-between align-items-center flex-wrap gap-1">
        <Typography className="fs-5 fw-600">{rfqTitle}</Typography>
        <Box className="d-flex">
          <Box className="mr-3 d-flex align-items-center tw-gap-5">
            <Button
              variant="contained"
              //   disabled={
              //     JSON.stringify(initialEstimateComment) ==
              //     JSON.stringify(estimateComments)
              //   }
              onClick={saveComments}
            >
              {t("tooltips.saveComment")}
            </Button>
            <Tooltip
              arrow
              placement="bottom"
              title={t("tooltips.exitCommentMode")}
            >
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

export default PoCommentHeader;
