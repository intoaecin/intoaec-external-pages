import SendIcon from "@mui/icons-material/Send";
import {
  Box,
  IconButton,
  Popover,
  PopoverVirtualElement,
  TextField,
} from "@mui/material";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
// import { useRfqCommentsData } from "./RfqSuggestionProvider";
export const RfqCommentPopup = forwardRef(
  (
    {
      onChange,
    }: //   type,
    //   onChange,
    {
      //   type: "ADMIN" | "LEAD";
      onChange: (
        commentText: string,
        currentLineItemId: string
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
    // const { addComments,structuredRfqComments ,setStructuredRfqComments} = useRfqCommentsData();
    const [currentLineItemId, setCurrentLineItemId] = useState<string>();
    const handleClose = () => {
      setAnchorEl(null);
      setCommentText(undefined);
      setCurrentLineItemId(undefined);
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
      if (el && typeof el === "object" && "getBoundingClientRect" in el) {
        const rect = el.getBoundingClientRect();
        setAnchorEl({
          getBoundingClientRect: () => ({
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            bottom: rect.bottom,
            right: rect.right,
            x: rect.x,
            y: rect.y,
            toJSON: () => rect.toJSON?.() ?? {},
          }),
          nodeType: 1,
        });
      } else {
        setAnchorEl(el);
      }
      setCurrentLineItemId(id);
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
        id={currentLineItemId}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        disableScrollLock
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
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
              console.log(commentText, currentLineItemId, "rfq comment text");

              if (commentText && currentLineItemId) {
                await onChange(commentText, currentLineItemId);
              } else {
                await onChange(commentText ?? "", "termsAndCondition");
              }
              // setStructuredRfqComments((prev)=>({
              //   ...prev,

              // }))
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

RfqCommentPopup.displayName = "RfqCommentPopup";
