import React from "react";
import { useTheme } from "@mui/material";

const RenderDivider = ({
  controller,
  currentController,
  onChange,
}: {
  controller: any;
  currentController?: string;
  onChange?: (value: any) => void;
}) => {
  const theme = useTheme();
  const rotation = controller?.value?.rotation || 0;

  const handleRotate = () => {
    const newRotation = (rotation + 90) % 360;
    if (onChange) {
      onChange({
        ...controller.value,
        rotation: newRotation,
      });
    }
  };

  const isVertical = rotation % 180 !== 0

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        minHeight: "40px",
        minWidth:"40px"
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#000",
          width: isVertical ? "1px" : "100%", // make width adjustable (e.g., 4px)
          height: isVertical ? "100%" : "1px",
        }}
      />

      {/* Rotate Button */}
      {controller?.controllerId === currentController && (
        <button
          onClick={handleRotate}
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            padding: "4px 8px",
            fontSize: "10px",
            backgroundColor: theme.palette.primary.main,
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            zIndex: 10,
            fontWeight: "bold",
          }}
        >
         {rotation}°
        </button>
      )}
    </div>
  );
};

export default RenderDivider;
