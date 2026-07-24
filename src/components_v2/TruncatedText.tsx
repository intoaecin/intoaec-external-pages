import React from "react";
import Tooltip from "@mui/material/Tooltip";

interface TruncatedTextProps {
  text: string | undefined;
  limit?: number;
  className?: string;
  showAll?: boolean;
  /** If true, uses CSS-based ellipsis instead of character-limit truncation */
  useEllipsis?: boolean;
  /** Optional max width for CSS ellipsis mode */
  maxWidth?: string | number;
}

export const TruncatedText: React.FC<TruncatedTextProps> = ({
  text,
  limit = 50,
  className = "",
  showAll = false,
  useEllipsis = false,
  maxWidth = "100%",
}) => {
  const truncateText = (content: string | undefined) => {
    if (!content) return "";
    if (!showAll && content.length > limit) {
      return content.slice(0, limit) + "...";
    }
    return content;
  };

  const truncated = truncateText(text);
  const needsTooltip = !showAll && (text?.length ?? 0) > limit;

  const textRef = React.useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = React.useState(false);

  const checkTruncation = () => {
    if (textRef.current) {
      setIsTruncated(textRef.current.scrollWidth > textRef.current.clientWidth);
    }
  };

  if (useEllipsis) {
    return (
      <Tooltip title={text || ""} arrow disableHoverListener={!isTruncated}>
        <span
          ref={textRef}
          onMouseEnter={checkTruncation}
          className={className}
          style={{
            display: "inline-block",
            maxWidth: maxWidth,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            verticalAlign: "middle",
          }}
        >
          {text}
        </span>
      </Tooltip>
    );
  }

  return (
    <span className={className}>
      {needsTooltip ? (
        <Tooltip title={text || ""} arrow>
          <span>{truncated}</span>
        </Tooltip>
      ) : (
        text
      )}
    </span>
  );
};
