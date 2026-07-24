import React from "react";

export const TimeTrackingMenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="4"
      width="13"
      height="14"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M3 8.5H16"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M7 2.75V5.25"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M12 2.75V5.25"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <circle
      cx="17"
      cy="16"
      r="4"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M17 14.25V16.15L18.25 17"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default TimeTrackingMenuIcon;
