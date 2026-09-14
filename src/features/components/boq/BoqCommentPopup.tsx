import SendIcon from "@mui/icons-material/Send";
import {
  Box,
  IconButton,
  Popover,
  PopoverVirtualElement,
  TextField
} from "@mui/material";
import { forwardRef, useImperativeHandle, useState } from "react";
export const BoqCommentPopup = forwardRef(
  (
    {
      onChange,
    }: //   type,
    //   onChange,
    {
      //   type: "ADMIN" | "LEAD";
      onChange: (
        commentText: string,
        currentId: string
      ) => Promise<void> | void;
    },
    ref
  ) => {
    const [anchorEl, setAnchorEl] = useState<
      | Element
      | (() => Element)
      | PopoverVirtualElement
      | (() => PopoverVirtualElement)
      | null
    >();
    const [currentId, setCurrentId] = useState<string>();
    const handleClose = () => {
      setAnchorEl(null);
      setCommentText(undefined);
      setCurrentId(undefined);
    };
    const handleOpen = (
      el:
        | Element
        | (() => Element)
        | PopoverVirtualElement
        | (() => PopoverVirtualElement)
        | null,
      id: string
    ) => {
      setAnchorEl(el);
      setCurrentId(id);
    };

    const [commentText, setCommentText] = useState<string>();
    useImperativeHandle(
      ref,
      () => ({
        handleClose,
        handleOpen,
      }),
      []
    );

    return (
      <Popover
        id={currentId}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        disableScrollLock
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box sx={{ p: 2 }}>
          <TextField
            multiline
            label="Add your suggestion"
            placeholder="Enter your Text"
            fullWidth
            variant="outlined"
            focused
            value={commentText}
            onChange={(e) => {
              setCommentText(e.target.value);
            }}
          />
          <IconButton
            className="btnSuccessUI my-1 float-right"
            sx={{
              borderRadius: "4px",
              height: "32px !important",
              width: "100px!important",
            }}
            onClick={async () => {
              console.log(commentText, "boq comment text");

              if (commentText && currentId) {
                await onChange(commentText, currentId);
              }
              handleClose();
            }}
          >
            <span className="fs-7">{"Save"}</span>
            <SendIcon className="ml-1" style={{ fill: "#FFF" }} />
          </IconButton>
        </Box>
      </Popover>
    );
  }
);

BoqCommentPopup.displayName = "BoqCommentPopup";
