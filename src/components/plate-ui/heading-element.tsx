import React from "react";
import { withRef, withVariants } from "@udecode/cn";
import { PlateElement } from "@udecode/plate-common";
import { cva } from "class-variance-authority";

const headingVariants = cva("tw-", {
  variants: {
    variant: {
      h1: "tw-mb-1 tw-font-heading tw-text-[30px] tw-font-bold md:tw-text-2xl lg:tw-text-4xl",
      h2: "tw-mb-px tw-font-heading tw-text-2xl tw-font-semibold tw-tracking-tight",
      h3: "tw-mb-px tw-font-heading tw-text-xl tw-font-semibold tw-tracking-tight",
      h4: "tw-font-heading tw-text-lg tw-font-semibold tw-tracking-tight",
      h5: "tw-text-lg tw-font-semibold tw-tracking-tight",
      h6: "tw-text-base tw-font-semibold tw-tracking-tight",
    },
    isFirstBlock: {
      true: "tw-mt-0",
      false: "tw-",
    },
  },
});

const HeadingElementVariants = withVariants(PlateElement, headingVariants, [
  "isFirstBlock",
  "variant",
]);

export const HeadingElement = withRef<typeof HeadingElementVariants>(
  ({ variant = "h1", isFirstBlock, children, ...props }, ref) => {
    const { element, editor } = props;

    const Element = variant!;

    return (
      <HeadingElementVariants
        ref={ref}
        asChild
        variant={variant}
        isFirstBlock={element === editor.children[0]}
        {...props}
      >
        <Element>{children}</Element>
      </HeadingElementVariants>
    );
  }
);
