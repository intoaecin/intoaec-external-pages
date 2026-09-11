import React from "react";

const RenderCheckbox = ({ controller }: { controller: any }) => {
  return (
    <div
      className="d-flex"
      style={{
        width: "100%",
        height: "100%",
        ...controller?.style,
      }}
    >
      {" "}
      <input
        type="checkbox"
        style={{ width: "15px", height: "15px" }}
        name="checkbox"
      />{" "}
      &nbsp;&nbsp;
      <div
        style={{
          flex: 1,
          wordBreak: "break-word",
          overflowWrap: "break-word",
          whiteSpace: "pre-wrap",
          lineHeight: "1.4",
        }}
      >
        {controller.label}
      </div>
    </div>
  );
};

export default RenderCheckbox;
