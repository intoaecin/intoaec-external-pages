import React from "react";
import { cn, withRef } from "@udecode/cn";
import {
  PlateElement,
  useEditorReadOnly,
  withHOC,
} from "@udecode/plate-common";
import { ELEMENT_IMAGE, Image, useMediaState } from "@udecode/plate-media";
import { ResizableProvider, useResizableStore } from "@udecode/plate-resizable";

import { Caption, CaptionTextarea } from "./caption";
import { MediaPopover } from "./media-popover";
import {
  mediaResizeHandleVariants,
  Resizable,
  ResizeHandle,
} from "./resizable";

export const ImageElement = withHOC(
  ResizableProvider,
  withRef<typeof PlateElement>(
    ({ className, children, nodeProps, ...props }, ref) => {
      const { focused, selected, align = "center" } = useMediaState();
      const width = useResizableStore().get.width();
      const readOnly = useEditorReadOnly();

      return (
        <MediaPopover pluginKey={ELEMENT_IMAGE}>
          <PlateElement
            ref={ref}
            className={cn("tw-py-2.5", className)}
            {...props}
          >
            <figure
              className="tw-group tw-relative tw-m-0"
              contentEditable={false}
            >
              {!readOnly ? (
                <Resizable
                  align={align}
                  options={{
                    align,
                    readOnly: true,
                  }}
                >
                  <ResizeHandle
                    options={{ direction: "left" }}
                    className={mediaResizeHandleVariants({ direction: "left" })}
                  />
                  <Image
                    className={cn(
                      "tw-block tw-w-full tw-max-w-full tw-cursor-pointer tw-object-cover tw-px-0",
                      "tw-rounded-sm",
                      focused &&
                        selected &&
                        "tw-ring-2 tw-ring-ring tw-ring-offset-2"
                    )}
                    alt=""
                    {...nodeProps}
                  />
                  <ResizeHandle
                    options={{ direction: "right" }}
                    className={mediaResizeHandleVariants({
                      direction: "right",
                    })}
                  />
                </Resizable>
              ) : (
                <Image
                  className={cn(
                    "tw-block tw-w-full tw-max-w-full tw-cursor-pointer tw-object-cover tw-px-0",
                    "tw-rounded-sm",
                    focused &&
                      selected &&
                      "tw-ring-2 tw-ring-ring tw-ring-offset-2"
                  )}
                  alt=""
                  {...nodeProps}
                />
              )}
            </figure>

            {children}
          </PlateElement>
        </MediaPopover>
      );
    }
  )
);
