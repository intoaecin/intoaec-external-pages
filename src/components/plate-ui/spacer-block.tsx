import { PlateElement, PlateElementProps } from "@udecode/plate-common";
import { useEffect } from "react";

export function SpacerBlockElement({
  className,
  children,
  ...props
}: PlateElementProps) {
  useEffect(() => {
    console.log("APSASDASDSADSDASD");
  }, []);
  return (
    <PlateElement asChild className={className} {...props}>
      <div
        className="tw-h-[50px]"
        style={{ pageBreakAfter: "always", backgroundColor: "red" }}
      >
        {""}
      </div>
    </PlateElement>
  );
}
