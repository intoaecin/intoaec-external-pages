import React from "react";

const CheckboxIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 17 16">
      {/* Box outline uses stroke only and does not inherit fill */}
      <rect
        x="0.383301"
        y="0.398438"
        width="16"
        height="15.1765"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
      />
      {/* Tick uses currentColor so it follows parent 'color' (changes on hover) */}
      <path
        d="M5.20128 8.05154L5.0833 7.93964L4.96533 8.05154L4.26533 8.71552L4.1342 8.83989L4.26533 8.96427L7.06533 11.6202L7.1833 11.7321L7.30128 11.6202L13.3013 5.92897L13.4324 5.8046L13.3013 5.68022L12.6013 5.01625L12.4833 4.90435L12.3653 5.01625L7.1833 9.93156L5.20128 8.05154Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default CheckboxIcon;
