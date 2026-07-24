import { cn } from "@udecode/cn";

import { Toolbar } from "./toolbar";

export const FixedToolbar = ({
  className,
  enableHorizontalScroll,
  ...props
}: React.ComponentProps<typeof Toolbar> & {
  enableHorizontalScroll?: boolean;
}) => {
  return (
    <Toolbar
      className={cn(
        "supports-backdrop-blur:tw-bg-background/60 tw-sticky tw-left-0 tw-top-[57px] tw-z-50 tw-w-full tw-rounded-t-lg tw-bg-background/95",
        enableHorizontalScroll ? "tw-overflow-x-auto" : "tw-overflow-x-hidden",
        className,
      )}
      {...props}
    />
  );
};
