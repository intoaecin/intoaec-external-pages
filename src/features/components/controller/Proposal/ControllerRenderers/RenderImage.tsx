import React from "react";

const RenderImage = ({
  controller,
  isAnswer = false,
  onChange,
}: {
  controller: any;
  isAnswer?: boolean;
  onChange?: (value: any) => void;
}) => {
  const imageSource =
    (typeof controller?.value?.url === "string" && controller.value.url.trim()) ||
    (typeof controller?.value?.buffer === "string" &&
      controller.value.buffer.trim()) ||
    (typeof controller?.url === "string" && controller.url.trim()) ||
    "";
  const hasContent = Boolean(imageSource);

  if (!hasContent) {
    return (
      <div style={{ minHeight: "20px" }}>
        {isAnswer && onChange ? (
          <button
            type="button"
            onClick={() => {
              const nextOptions = Array.isArray(controller?.options)
                ? [...controller.options, { description: "", isOther: true }]
                : [{ description: "", isOther: true }];
              onChange({ ...controller, options: nextOptions });
            }}
            style={{
              border: "1px dashed #b0b0b0",
              background: "transparent",
              padding: "6px 10px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            + Add Choice
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        ...controller?.style
      }}
    >
      <img
        src={imageSource}
        alt={controller?.value?.fileName ?? controller?.fileName ?? "image"}
        style={{
          objectFit: "cover",
          padding: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
};

export default RenderImage;
