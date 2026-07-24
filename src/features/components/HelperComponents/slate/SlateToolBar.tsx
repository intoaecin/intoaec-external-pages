import TickIcon from "@/assets/icons/tick-icon";
import { formatSeedValues } from "@/lib/helpers";
import FormatBold from "@mui/icons-material/FormatBold";
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { EditorFunctions } from "./utils";

import { useCellProperties } from "@/features/hooks/useCellProperties";
import { StrikethoughIcon } from "@/assets/icons/strikethough-icon";
import FormatAlignCenter from "@mui/icons-material/FormatAlignCenter";
import FormatAlignJustify from "@mui/icons-material/FormatAlignJustify";
import FormatAlignLeft from "@mui/icons-material/FormatAlignLeft";
import FormatAlignRight from "@mui/icons-material/FormatAlignRight";
import FormatColorFill from "@mui/icons-material/FormatColorFill";
import FormatColorText from "@mui/icons-material/FormatColorText";
import FormatItalic from "@mui/icons-material/FormatItalic";
import FormatUnderlined from "@mui/icons-material/FormatUnderlined";
import InsertLink from "@mui/icons-material/InsertLink";

import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import TableViewIcon from "@mui/icons-material/TableView";
import { debounce } from "lodash";
import {
  PopupState,
  bindPopover,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import React from "react";
import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";

export const TableProperties = ({
  popupState,
  onChangeBgColor,
  onChangeBorderColor,
  onChangeBorderWidth,
  backgroundColor,
  borderColor,
  width,
}: {
  popupState: PopupState;
  onChangeBorderWidth?: (width: number) => void;
  onChangeBorderColor?: (color: string) => void;
  onChangeBgColor?: (color: string) => void;
  width?: number;
  borderColor?: string;
  backgroundColor?: string;
}) => {
  const handleDebouncedChangeBackground = debounce((color) => {
    onChangeBgColor?.(color);
  }, 500);

  const handleDebouncedChangeBorder = debounce((color) => {
    onChangeBorderColor?.(color);
  }, 500);
  return (
    <Popover
      {...bindPopover(popupState)}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      disableScrollLock
    >
      <Grid container direction={"column"} gap={2} p={2}>
        <Grid item direction={"column"}>
          <Typography variant="body2">Border width</Typography>
          <TextField
            type="number"
            value={width}
            variant="standard"
            onChange={(e) => {
              const value = e.target.value;
              if (/^[0-9]+$/.test(value)) {
                onChangeBorderWidth?.(parseFloat(value));
              }
            }}
            placeholder="Width"
          />
        </Grid>

        <Grid item container direction={"row"} justifyContent={"space-between"}>
          <Box>
            <Typography variant="body2">Border color</Typography>
            <ColorPicker
              icon={
                <span
                  style={{
                    backgroundColor: borderColor,
                    border: "1px solid",
                    padding: 10,
                    width: 10,
                    height: 10,
                    display: "inline-block",
                  }}
                ></span>
              }
              color={borderColor ?? "#fff"}
              onChange={(color) => {
                handleDebouncedChangeBorder(color);
              }}
            />
          </Box>
          <Box>
            <Typography variant="body2">Background color</Typography>
            <ColorPicker
              icon={
                <span
                  style={{
                    backgroundColor: backgroundColor,
                    border: "1px solid",
                    padding: 10,
                    width: 10,
                    height: 10,
                    display: "inline-block",
                  }}
                ></span>
              }
              color={backgroundColor ?? "#fff"}
              onChange={(color) => {
                handleDebouncedChangeBackground(color);
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </Popover>
  );
};

const ColorPicker = ({
  icon,
  onChange,
  color,
}: {
  icon: any;
  onChange?: (color: string) => void;
  color: string;
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLParagraphElement | null>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <div
        onClick={(e) => {
          setAnchorEl(e.currentTarget);
        }}
      >
        {icon}
      </div>

      <Popover
        onClose={() => {
          setAnchorEl(null);
        }}
        anchorEl={anchorEl}
        open={open}
      >
        <HexColorPicker
          color={color}
          onChange={(e) => {
            onChange?.(e);
          }}
        />
      </Popover>
    </>
  );
};

export const SlateToolBar = ({
  editor,
}: {
  editor: BaseEditor & ReactEditor;
}) => {
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLSpanElement | null>(null);
  const [fontColor, setFontColor] = useState("#fff");
  const [backgroundColor, setBackgroundColor] = useState("#fff");
  const [tableBorderColor, setTableBorderColor] = useState("#fff");
  const [tableBackgroundColor, setTablebackgroundColor] = useState("#fff");
  const [tableBorderWidth, setTableBorderWidth] = useState<number>(0);
  const popupState = usePopupState({
    variant: "popover",
    popupId: "demoPopover",
  });
  const { cellProperties, setCellProperties } = useCellProperties();
  const handleLinkClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    setAnchorEl(event.currentTarget); // Set the anchor element when the link is clicked
    setLinkPopoverOpen(true);
  };

  const handleLinkClose = () => {
    setAnchorEl(null); // Clear the anchor element when the popover is closed
    setLinkPopoverOpen(false);
  };

  const toolbarData = [
    {
      name: "BOLD",
      icon: <FormatBold />,
      onClick: () => {
        EditorFunctions?.makeBold(editor);
      },
    },
    {
      name: "ITALIC",
      icon: <FormatItalic />,
      onClick: () => {
        EditorFunctions?.makeItalic(editor);
      },
    },
    {
      name: "UNDERLINE",
      icon: <FormatUnderlined />,
      onClick: () => {
        EditorFunctions?.makeUnderline(editor);
      },
    },
    {
      name: "FONT_SIZE",
      icon: <FormatUnderlined />,
      onChange: (type: string) => {
        EditorFunctions?.changeFontType(editor, type);
      },
    },
    {
      name: "LINK",
      icon: <InsertLink />,
      onChange: (link: string) => {
        EditorFunctions?.insertLink(editor, link);
      },
    },
    {
      name: "FONT_COLOR_PICKER",
      icon: <FormatColorText />,
      onChange: (color: string) => {
        EditorFunctions?.changeFontColor(editor, color);
      },
    },
    {
      name: "BACKGROUND_COLOR_PICKER",
      icon: <FormatColorFill />,
      onChange: (color: string) => {
        EditorFunctions?.changeBackgroundColor(editor, color);
      },
    },
    {
      name: "STRIKE_THROUGH",
      icon: <StrikethoughIcon />,
      onClick: () => {
        EditorFunctions?.makeStrikeThrough(editor);
      },
    },
    {
      name: "LEFT_ALIGN",
      icon: <FormatAlignLeft />,
      onClick: () => {
        EditorFunctions?.alignLeft(editor);
      },
    },
    {
      name: "RIGHT_ALIGN",
      icon: <FormatAlignRight />,
      onClick: () => {
        EditorFunctions?.alignRight(editor);
      },
    },
    {
      name: "CENTRE_ALIGN",
      icon: <FormatAlignCenter />,
      onClick: () => {
        EditorFunctions?.alignCenter(editor);
      },
    },
    {
      name: "JUSTIIFY",
      icon: <FormatAlignJustify />,
      onClick: () => {
        EditorFunctions?.alignJustify(editor);
      },
    },

    {
      name: "FONT_STYLE",
      icon: <FormatUnderlined />,
      onChange: (fontFamily: string) => {
        EditorFunctions.changeFontFamily(editor, fontFamily);
      },
    },
    {
      name: "BULLETED",
      icon: <FormatListBulletedIcon />,
      onClick: () => {
        EditorFunctions.insertUnorderedList(editor);
      },
    },
    {
      icon: <FormatListNumberedIcon />,
      name: "NUMBERED",
      onClick: () => {
        EditorFunctions.insertOrderedList(editor);
      },
    },
    {
      icon: <TableViewIcon {...bindTrigger(popupState)} />,
      name: "TABLE_PROPERTIES",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "#F5F5F5",
        alignItems: "center",
        height: "50px",
        paddingLeft: "10px",
      }}
    >
      <TableProperties
        popupState={popupState}
        backgroundColor={cellProperties?.backgroundColor}
        borderColor={cellProperties?.borderColor}
        width={cellProperties?.width}
        onChangeBgColor={(color) => {
          setCellProperties?.((prev) => ({
            ...prev,
            backgroundColor: color,
          }));
        }}
        onChangeBorderColor={(color) => {
          setCellProperties?.((prev) => ({
            ...prev,
            borderColor: color,
          }));
        }}
        onChangeBorderWidth={(width) => {
          setCellProperties?.((prev) => ({
            ...prev,
            width: width,
          }));
        }}
      />
      {toolbarData?.map((data) => (
        <Tooltip key={data?.name} title={formatSeedValues(data?.name)}>
          <div key={data?.name} style={{ cursor: "pointer" }}>
            {data?.name === "FONT_COLOR_PICKER" ||
            data?.name === "BACKGROUND_COLOR_PICKER" ? (
              <div style={{ marginRight: "20px" }}>
                <ColorPicker
                  color={
                    data?.name === "FONT_COLOR_PICKER"
                      ? fontColor
                      : backgroundColor
                  }
                  icon={
                    <>
                      {data?.icon}
                      <div
                        className="position-relative"
                        style={{
                          backgroundColor:
                            data?.name === "FONT_COLOR_PICKER"
                              ? fontColor
                              : backgroundColor,
                          padding: 3,
                          top: "-10px",
                        }}
                      ></div>
                    </>
                  }
                  onChange={(color: string) => {
                    if (data?.name === "FONT_COLOR_PICKER") {
                      setFontColor(color);
                    } else {
                      setBackgroundColor(color);
                    }
                    data?.onChange?.(color);
                  }}
                />
              </div>
            ) : data?.name === "FONT_SIZE" ? (
              <div style={{ marginRight: "20px" }}>
                <FormControl fullWidth>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    SelectDisplayProps={{
                      style: {
                        height: 10,
                        padding: 8,
                        fontSize: "10px",
                      },
                    }}
                    onChange={(e, c) => {
                      data?.onChange?.(e.target.value as string);
                    }}
                    sx={{
                      p: 0,
                      m: 0,
                      "& .MuiSelect-select": {
                        minHeight: "0",
                        width: "80px",
                      },
                    }}
                    MenuProps={{
                      disableScrollLock: true,
                    }}
                  >
                    <MenuItem
                      value={"heading-one"}
                      sx={{
                        fontWeight: 700,
                        "& .MuiMenuItem-root": {
                          fontSize: "80px",
                        },
                      }}
                    >
                      Heading 1
                    </MenuItem>
                    <MenuItem value={"heading-two"}>Heading 2</MenuItem>
                    <MenuItem value={"heading-three"}>Heading 3</MenuItem>
                    <MenuItem value={"paragraph"}>Normal Text</MenuItem>
                  </Select>
                </FormControl>
              </div>
            ) : data?.name === "FONT_STYLE" ? (
              <div style={{ marginRight: "20px" }}>
                <FormControl fullWidth>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    SelectDisplayProps={{
                      style: {
                        height: 10,
                        padding: 8,
                        fontSize: "10px",
                      },
                    }}
                    onChange={(e, c) => {
                      data?.onChange?.(e.target.value as string);
                    }}
                    sx={{
                      p: 0,
                      m: 0,
                      "& .MuiSelect-select": {
                        minHeight: "0",
                        width: "80px",
                      },
                    }}
                    MenuProps={{
                      disableScrollLock: true,
                    }}
                  >
                    <MenuItem value={`Times New Roman,serif`}>
                      Times new Roman
                    </MenuItem>
                    <MenuItem value={`Verdana,sans-serif`}>Verdana</MenuItem>
                    <MenuItem value={`Arial,sans-serif`}>Arial</MenuItem>
                    <MenuItem value={`Calibri,sans-serif`}>Calibri</MenuItem>
                  </Select>
                </FormControl>
              </div>
            ) : data?.name === "LINK" ? (
              <div style={{ marginRight: "20px" }}>
                <Tooltip title="">
                  <span onClick={(e) => handleLinkClick(e)}>{data?.icon}</span>
                </Tooltip>
                <Popover
                  open={linkPopoverOpen}
                  anchorEl={anchorEl}
                  onClose={handleLinkClose}
                >
                  <div
                    style={{
                      padding: 10,
                    }}
                  >
                    <InputLabel htmlFor="link-text">Paste Link:</InputLabel>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <input
                        id="link-text"
                        type="text"
                        value={linkText}
                        onChange={(e) => setLinkText(e.target.value)}
                      />
                      <TickIcon
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          data?.onChange?.(linkText);
                          handleLinkClose();
                        }}
                        width={20}
                        height={20}
                      />
                    </div>
                  </div>
                </Popover>
              </div>
            ) : data?.name === "TABLE_PROPERTIES" ? (
              <>
                {cellProperties && (
                  <span style={{ marginRight: "20px" }}>{data?.icon}</span>
                )}
              </>
            ) : (
              <span
                onClick={() => data?.onClick?.()}
                style={{ marginRight: "20px" }}
              >
                {data?.icon}
              </span>
            )}
          </div>
        </Tooltip>
      ))}
    </div>
  );
};
