import PlateEditor from "@/components/plate-editor";
import React from "react";

const RenderTermsandCondition = ({ controller }: { controller: any }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%"
      }}
    >
      <PlateEditor
        id={`preview-${controller?.controllerId}`}
        intialValue={controller?.value}
        readOnly
      />
    </div>
  );
};

export default RenderTermsandCondition;
