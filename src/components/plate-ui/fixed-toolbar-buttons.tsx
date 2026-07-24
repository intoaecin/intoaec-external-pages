import {
  MARK_BOLD,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
} from "@udecode/plate-basic-marks";
import { useEditorReadOnly, useEditorRef } from "@udecode/plate-common";

import { Icons } from "@/components/icons";

import { TableProperties } from "@/features/components/HelperComponents/slate/SlateToolBar";
import { useCellProperties } from "@/features/hooks/useCellProperties";
import TableViewIcon from "@mui/icons-material/TableView";
import { MARK_BG_COLOR, MARK_COLOR } from "@udecode/plate-font";
import { ListStyleType } from "@udecode/plate-indent-list";
import { bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { AlignDropdownMenu } from "./align-dropdown-menu";
import { ColorDropdownMenu } from "./color-dropdown-menu";
import { EmojiDropdownMenu } from "./emoji-dropdown-menu";
import { IndentListToolbarButton } from "./indent-list-toolbar-button";
import { IndentToolbarButton } from "./indent-toolbar-button";
import { LineHeightDropdownMenu } from "./line-height-dropdown-menu";
import { LinkToolbarButton } from "./link-toolbar-button";
import { MarkToolbarButton } from "./mark-toolbar-button";
import { OutdentToolbarButton } from "./outdent-toolbar-button";
import { ToolbarGroup } from "./toolbar";
import { TurnIntoDropdownMenu } from "./turn-into-dropdown-menu";
import { MediaToolbarButton } from "./media-toolbar-button";
import { ELEMENT_IMAGE } from "@udecode/plate-media";
import { useMyEditorRef } from "@/lib/plate/plate-types";
import { FontSizeDropDownMenu } from "./font-size-drop-down-menu";
import { useTranslation } from "next-i18next";

export function FixedToolbarButtons({
  onUpload,
  showMediaTool,
  onBgTextColorChange,
  parentUploadPath,
  hideEmoji,
  isDailyLog,
  id,
  enableHorizontalScroll = true,
}: {
  onUpload?: (e: string) => void;
  showMediaTool?: boolean;
  onBgTextColorChange?: (color: string) => void;
  parentUploadPath?: string;
  hideEmoji?: boolean;
  isDailyLog?: boolean;
  id?: string;
  enableHorizontalScroll?: boolean;
}) {
  const editor = useEditorRef(id);
  const readOnly = useEditorReadOnly(editor.id ?? id);

  const { t } = useTranslation();
  const { cellProperties, setCellProperties } = useCellProperties();
  const popupState = usePopupState({
    variant: "popover",
    popupId: "demoPopover",
  });
  
  return (
    <div
      className={`tw-w-full tw-flex tw-items-center tw-gap-1 tw-px-1 tw-bg-background ${
        enableHorizontalScroll
          ? "tw-flex-nowrap tw-min-w-max"
          : "tw-flex-wrap tw-min-w-0"
      }`}
    >
      {!readOnly && (
        <>
          {/* Text formatting group */}
          <ToolbarGroup>
            <TurnIntoDropdownMenu />
            <FontSizeDropDownMenu id={id} />
          </ToolbarGroup>
          
          {/* Basic formatting */}
          <ToolbarGroup>
            <MarkToolbarButton tooltip="Bold (⌘+B)" nodeType={MARK_BOLD}>
              <Icons.bold />
            </MarkToolbarButton>
            
            <MarkToolbarButton tooltip="Italic (⌘+I)" nodeType={MARK_ITALIC}>
              <Icons.italic />
            </MarkToolbarButton>
            
            <MarkToolbarButton tooltip="Underline (⌘+U)" nodeType={MARK_UNDERLINE}>
              <Icons.underline />
            </MarkToolbarButton>

            <MarkToolbarButton
              tooltip="Strikethrough (⌘+⇧+M)"
              nodeType={MARK_STRIKETHROUGH}
            >
              <Icons.strikethrough />
            </MarkToolbarButton>
          </ToolbarGroup>

          {/* Color tools */}
          <ToolbarGroup>
            <ColorDropdownMenu nodeType={MARK_COLOR} tooltip="Text Color">
              <Icons.color />
            </ColorDropdownMenu>
            
            <ColorDropdownMenu
              nodeType={MARK_BG_COLOR}
              tooltip="Highlight Color"
            >
              <Icons.bg />
            </ColorDropdownMenu>
            
            <ColorDropdownMenu
              nodeType={MARK_BG_COLOR}
              tooltip={t("templateCenter.proposal.icons.bgText")}
              setSelectedColor={onBgTextColorChange}
            >
              <Icons.bgText />
            </ColorDropdownMenu>
          </ToolbarGroup>

          {/* Alignment and spacing */}
          <ToolbarGroup>
            <AlignDropdownMenu />
            <LineHeightDropdownMenu />
          </ToolbarGroup>

          {/* Lists and indentation */}
          <ToolbarGroup>
            <IndentListToolbarButton nodeType={ListStyleType.Disc} />
            <IndentListToolbarButton nodeType={ListStyleType.Decimal} />
            <OutdentToolbarButton />
            <IndentToolbarButton />
          </ToolbarGroup>

          {/* Links and media */}
          <ToolbarGroup>
            <LinkToolbarButton />

            {isDailyLog && (
              <MediaToolbarButton
                onUpload={onUpload}
                nodeType={ELEMENT_IMAGE}
                parentUploadPath={parentUploadPath}
              />
            )}

            {!hideEmoji && <EmojiDropdownMenu />}
          </ToolbarGroup>

          {/* Table properties */}
          {cellProperties && (
            <ToolbarGroup>
              <TableViewIcon {...bindTrigger(popupState)} />
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
            </ToolbarGroup>
          )}
        </>
      )}
    </div>
  );
}
