import React from "react";

export const UIHighLightMatchComponent = (text: string, highlight: string) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <span key={index} style={{ fontWeight: "bold", color: "black" }}>
            {part}
          </span>
        ) : (
          <span style={{ color: "#aaa" }} key={index}>
            {part}
          </span>
        )
      )}
    </span>
  );
};
