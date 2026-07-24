import React from "react";

interface NoPortfolioImageProps extends React.SVGProps<SVGSVGElement> {
  label?: string; // dynamic text
  showLabel?: boolean; // optional toggle
}

const NoPortfolioImage: React.FC<NoPortfolioImageProps> = ({
  label = "No Image Found",
  showLabel = true,
  ...props
}) => {
  return (
    <div
      style={{
        width: props.width || "270px",
        height: props.height || "150px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#F1F1F1",
      }}
    >
      <svg
        {...props}
        viewBox="0 0 270 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <rect width="270" height="150" fill="#F1F1F1" />
        <g clipPath="url(#clip0_16551_580654)">
          <path
            d="M168 88.6667V37.3333C168 33.3 164.7 30 160.667 30H109.333C105.3 30 102 33.3 102 37.3333V88.6667C102 92.7 105.3 96 109.333 96H160.667C164.7 96 168 92.7 168 88.6667ZM122.167 68.5L131.333 79.5367L144.167 63L160.667 85H109.333L122.167 68.5Z"
            fill="#C2CFE0"
          />
        </g>
        <defs>
          <clipPath id="clip0_16551_580654">
            <rect width="88" height="88" fill="white" transform="translate(91 19)" />
          </clipPath>
        </defs>
      </svg>

      {/* Render dynamic label */}
      {showLabel && (
        <span style={{ marginTop: "8px", color: "#666", fontSize: "14px" }}>
          {label}
        </span>
      )}
    </div>
  );
};

export default NoPortfolioImage;
