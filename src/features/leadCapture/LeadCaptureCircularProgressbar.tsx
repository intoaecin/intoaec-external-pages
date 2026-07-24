import React from 'react';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import { useTheme } from '@mui/material/styles';
import { CircularProgressbarStyles } from 'react-circular-progressbar/dist/types';
import { useRouter } from 'next/router';

interface CustomCircularProgressbarProps {
  value: string | string[] | undefined;
}

const CustomCircularProgressbar: React.FC<CustomCircularProgressbarProps> = ({ value }) => {
  const theme = useTheme();
  const router = useRouter();

  const getRedirectQuery = router.query.redirect;
  const customStyles: CircularProgressbarStyles = {
    root: {
      display: 'flex',
    },
    path: {
      stroke: theme.palette.primary.dark,
      strokeLinecap: 'round',
      transition: 'stroke-dashoffset 0.5s ease 0s',
      transform: 'rotate(0turn)',
      transformOrigin: 'center center',
    },
    trail: {
      stroke: theme.palette.primary.light,
      strokeLinecap: 'butt',
      transform: 'rotate(0.25turn)',
      transformOrigin: 'center center',
    },
    background: {
      fill: theme.palette.background.default,
    },
  };
  const multiplier = getRedirectQuery ? 2.5 : 12.5; 
  return (
    <CircularProgressbarWithChildren
      value={Number(value) * multiplier}
      styles={customStyles}
    >
  
    <div
      className="d-flex column"
      style={{ fontSize: 12, marginTop: -5, textAlign: "center" }}
    >
      <div style={{ color: "#7C7C7C" }}>Question</div>
      <div style={{ fontWeight: 600, fontSize: "20px" }}>
        {value}
        {getRedirectQuery ? "-5" : "-8"}
      
      </div>
    </div>
    </CircularProgressbarWithChildren>
  );
};

export default CustomCircularProgressbar;
