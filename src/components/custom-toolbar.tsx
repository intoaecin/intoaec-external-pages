import React from "react";
import { TooltipProvider } from "./plate-ui/tooltip";
import { FixedToolbar } from "./plate-ui/fixed-toolbar";
import { FixedToolbarButtons } from "./plate-ui/fixed-toolbar-buttons";

export const PlateEditorCustomToolBar = ({
  onUpload,
  showMediaTool,
  parentUploadPath,
  onBgTextColorChange,
  hideEmoji,
  isDailyLog,
  id,
  enableHorizontalScroll = false,
}: {
  onUpload?: (e: string) => void;
  onBgTextColorChange?: (color: string) => void;
  showMediaTool?: boolean;
  parentUploadPath?: string;
  hideEmoji?: boolean;
  isDailyLog?: boolean;
  id?: string;
  enableHorizontalScroll?: boolean;
}) => {
  return (
    <div
      className={`tw-w-full tw-min-w-0 tw-bg-background tw-overflow-y-hidden tw-border-b tw-border-border ${enableHorizontalScroll ? "tw-overflow-x-auto" : "tw-overflow-x-hidden"
        }`}
    >
      <TooltipProvider>
        <FixedToolbar
          className={`custom-toolbar no-global-styles tw-w-full ${enableHorizontalScroll ? "tw-overflow-x-auto" : "tw-overflow-x-hidden"
            }`}
          enableHorizontalScroll={enableHorizontalScroll}
        >
          <FixedToolbarButtons
            onUpload={onUpload}
            showMediaTool={showMediaTool}
            hideEmoji={hideEmoji}
            onBgTextColorChange={onBgTextColorChange}
            parentUploadPath={parentUploadPath}
            isDailyLog={isDailyLog}
            id={id}
            enableHorizontalScroll={enableHorizontalScroll}
          />
        </FixedToolbar>
      </TooltipProvider>
    </div>
  );
};
