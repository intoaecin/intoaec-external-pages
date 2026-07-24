import React from "react";

const LocationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    xlinkHref="http://www.w3.org/1999/xlink"
  >
    <mask
      id="mask0_843_46758"
      style={{ maskType: "alpha" }}
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="24"
      height="24"
    >
      <rect width="24" height="24" fill="url(#pattern0)" />
    </mask>
    <g mask="url(#mask0_843_46758)">
      <rect width="24" height="24" fill="#192A3E" />
    </g>
    <defs>
      <pattern
        id="pattern0"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use xlinkHref="#image0_843_46758" transform="scale(0.0078125)" />
      </pattern>
      <image
        id="image0_843_46758"
        width="128"
        height="128"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default LocationIcon;
