import React from "react";
import NextImage from "../NextImage";
import {
  Box,
  CircularProgress,
  LinearProgress,
  keyframes,
} from "@mui/material";
import styled from "@emotion/styled";

const rotateAnimation = keyframes`
from {
  transform: rotateY(1deg);
}
to {
  transform: rotateY(356deg);
  
}
`;

const shine = keyframes`
0% {left: -100px}
20% {left: 100%}
100% {left: 100%}
`;

const MyComponent = styled.div`
  width: 240px;
  height: 240px;
  // background-image: url("/images/intoAECLogo.jpeg");
  // transform: rotateY(45deg);
  // animation: ${rotateAnimation} 1.5s linear infinite;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  box-shadow: 0px 0px 16px 15px #f8f7ff;
  border-radius: 126px;
  position: absolute;
  inset: 0;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
`;

const LoaderComponent = () =>{
 
    return (
      <div>
        
        <div className="progress-bar">
        <style dangerouslySetInnerHTML={{__html: "\n        /* Spinning Animation */\n.spin path {\n  animation: spin 2s linear infinite;\n}\n\n@keyframes spin {\n  0% { transform: rotate(0deg); }\n  100% { transform: rotate(360deg); }\n}\n\n/* Progress Bar Animation */\n.progress-bar path {\n  stroke: #00CCCC;\n  stroke-width: 2;\n  fill: #0066CC;\n  stroke-dasharray: 1000;\n  stroke-dashoffset: 1000;\n  animation: progress 2s ease-in-out infinite, fill-color 2s ease-in-out infinite;\n}\n\n.progress-bar  .red{\n   stroke: #0066CC;\n    animation: progress 2s ease-in-out infinite, fill-color-red  2s ease-in-out infinite;\n}\n\n@keyframes progress {\n  0% { stroke-dashoffset: 1000; }\n  100% { stroke-dashoffset: 0; }\n}\n\n/* Fill Animation */\n@keyframes fill-color {\n  0% { fill: rgba(0, 102, 204, 0); } /* Start transparent */\n  100% { fill: #00CCCC; } /* End with the original color */\n}\n\n@keyframes fill-color-red {\n  0% { fill: rgba(0, 102, 204, 0); } /* Start transparent */\n  100% { fill: #0066CC; } /* End with the original color */\n}\n\n/* Ripple Effect Animation */\n.ripple path {\n  animation: ripple 2s infinite, fill-color 2s infinite;\n  transform-origin: center;\n}\n\n@keyframes ripple {\n  0% {\n    transform: scale(1);\n    opacity: 1;\n  }\n  50% {\n    transform: scale(1.5);\n    opacity: 0.5;\n  }\n  100% {\n    transform: scale(1);\n    opacity: 1;\n  }\n}\n\n/* Fading Bars Animation */\n.fade path {\n  animation: fade 1.5s ease-in-out infinite, fill-color 1.5s ease-in-out infinite;\n}\n\n@keyframes fade {\n  0%, 100% { opacity: 1; }\n  50% { opacity: 0; }\n}\n\n/* Liquid Fill Animation */\n.liquid path {\n  stroke: #00CCCC;\n  stroke-width: 2;\n  fill: 00CCCC;\n  stroke-dasharray: 1000;\n  stroke-dashoffset: 1000;\n  animation: liquid 3s ease-in-out infinite, fill-color 3s ease-in-out infinite;\n}\n\n@keyframes liquid {\n  0% { stroke-dashoffset: 1000; }\n  50% { stroke-dashoffset: 500; }\n  100% { stroke-dashoffset: 1000; }\n}\n    " }} />

          <svg width={200} height={150} viewBox="0 0 522 389" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path className="#00CCCC red" fillRule="evenodd" clipRule="00CCCC" d="M393.8 267.3C379 267.3 365 267.2 351.1 267.4C348.2 267.4 347.5 265.8 346.5 263.9C337.9 246.2 335 227.4 336.8 208C338.9 184.7 347 163.7 364.1 147.1C381.6 130.1 403.2 123.1 427.1 122.4C442.7 121.9 458.3 122.3 473.9 122.3C475.9 122.3 477.5 122.3 478.8 124.5C484.6 134.9 490.7 145.3 497.1 156.5C494.9 156.5 493.4 156.5 491.9 156.5C472.5 156.5 453.2 156.5 433.8 156.5C405 156.5 386 168.4 376.8 191.9C366.6 218.1 372.8 247.7 392.2 265.6C392.5 265.8 392.8 266.2 393.8 267.3Z" stroke="0066CC" />
            <path className="red" fillRule="evenodd" clipRule="red" d="M288 101.7C288 102.5 287.4 103.1 286.6 103.1H282.2C281.4 103.1 280.8 102.5 280.8 101.7V97.3C280.8 96.5 281.4 95.9 282.2 95.9H286.6C287.4 95.9 288 96.5 288 97.3V101.7Z" stroke="#0066CC" />
            <path className="red" fillRule="evenodd" clipRule="red" d="M298.2 101.7C298.2 102.5 297.6 103.1 296.8 103.1H292.4C291.6 103.1 291 102.5 291 101.7V97.3C291 96.5 291.6 95.9 292.4 95.9H296.8C297.6 95.9 298.2 96.5 298.2 97.3V101.7Z" stroke="red" />
            <path className="red" fillRule="evenodd" d="M288 112.1C288 112.9 287.4 113.5 286.6 113.5H282.2C281.4 113.5 280.8 112.9 280.8 112.1V107.7C280.8 106.9 281.4 106.3 282.2 106.3H286.6C287.4 106.3 288 106.9 288 107.7V112.1Z" stroke="#0066CC" />
            <path className="red" fillRule="evenodd" clipRule="red" d="M298.2 112.1C298.2 112.9 297.6 113.5 296.8 113.5H292.4C291.6 113.5 291 112.9 291 112.1V107.7C291 106.9 291.6 106.3 292.4 106.3H296.8C297.6 106.3 298.2 106.9 298.2 107.7V112.1Z" stroke="#0066CC" />
            <path fillRule="evenodd" clipRule="red" d="M322.4 198.4C317.1 209.5 312.2 219.8 307.4 230.1C306.2 232.8 304 232.2 301.9 232.2C282.2 232.2 262.5 232.3 242.8 232.1C238.5 232.1 236.9 232.8 237.1 237.5C237.5 248.2 237.4 259 237.1 269.7C237 274 238.3 275 242.5 275C308.4 274.9 374.4 274.9 440.3 274.9C458 274.9 475.8 275 493.5 274.8C497.5 274.8 497.6 275.7 496 278.9C491.3 288.1 486.7 297.4 482.2 306.8C481 309.4 479.7 310.5 476.6 310.5C395.4 310.4 314.2 310.4 233.1 310.5C230 310.5 228.4 309.6 227.1 306.7C219.1 288.5 210.9 270.5 202.8 252.4C201.9 250.4 201.5 248.4 201.5 246.2C201.5 231.7 201.6 217.2 201.4 202.7C201.4 199.7 201.7 198.2 205.3 198.3C244 198.5 282.7 198.4 322.4 198.4Z" stroke="#00CCCC" />
            <path fillRule="evenodd" clipRule="evenodd" d="M223.1 171.6C232 159.8 240.4 148.9 248.6 138C249.8 136.4 251.3 136.5 252.9 136.5C284.9 136.5 317 136.5 349 136.5C349.5 138.4 348 139.2 347.2 140.2C339.8 149.7 332.4 159 325 168.5C323.5 170.4 322.1 171.7 319.3 171.7C287.7 171.5 256.1 171.6 223.1 171.6Z" stroke="#00CCCC" />
            <path className="red" fillRule="evenodd" clipRule="evenodd" d="M98.6 313.7C85.4 313.7 72.2 313.7 58.1 313.7C135.2 213.4 211.8 113.6 288.8 13.3C312.5 46.6 335.8 79.3 359.8 113C347.8 113 336.8 113 325.8 113C323.3 113 322.7 110.9 321.6 109.3C310.8 93.9 300.1 78.5 289.4 63.1C288.1 63 287.8 63.9 287.3 64.5C249.2 114.5 211 164.5 172.9 214.5C172.7 214.8 172.6 215.1 172.4 215.4C163.8 225.7 155.8 236.5 148 247.3C139.6 258.4 131.2 269.5 122.8 280.6C114.1 290.4 106.8 301.3 98.7 311.6C98 312.5 98 313.1 98.6 313.7Z" stroke="#0066CC" />
            <path fillRule="evenodd" clipRule="evenodd" d="M147.8 247.5C155.6 236.6 163.6 225.8 172.2 215.6C177.5 227.1 182.1 238.8 187.5 250.2C195.7 267.6 203.2 285.2 211.4 302.6C213.1 306.1 214.6 309.7 216.4 313.8C178.2 313.8 140.5 313.8 102.9 313.8C101.5 313.8 100.1 313.8 98.7 313.7C98.1 313.1 98.1 312.5 98.6 311.8C106.7 301.6 114 290.7 122.7 280.8C135.9 280.8 149 280.8 162.9 280.8C157.7 269.4 152.7 258.5 147.8 247.5Z" stroke="#00CCCC" />
            <path fillRule="evenodd" clipRule="evenodd" d="M125.3 203.8C119.3 190 113.5 176.9 107.3 162.9C104.2 169.9 101.3 176.4 98.4 182.9C80 225 61.5 267 43.2 309.1C41.7 312.4 40 313.5 36.4 313.4C26.6 313.1 16.7 313.1 6.79999 313.4C2.29999 313.5 2.39999 312.2 3.99999 308.7C27.8 256 51.5 203.1 75.2 150.3C78.9 142.1 82.6 134.1 86.1 125.8C87.2 123.3 88.4 122.3 91.2 122.4C101.8 122.6 112.3 122.6 122.9 122.4C125.7 122.4 127.3 123 128.6 125.8C134.9 140.2 141.4 154.5 147.9 168.9C148.7 170.6 149.7 172.2 148.1 174.3C140.5 183.9 133.2 193.5 125.3 203.8Z" stroke="#00CCCC" />
          </svg>
        </div>  
      </div>
    );
  }


const PageLoader = () => {
  return (
    <Box
      className="d-flex justify-content-center align-items-center bg-white"
      sx={{ width: "100%", height: "100vh" }}
    >
      {/* <span style={{ position: "absolute" }}>
        <NextImage
          src={"/images/logo-icon.png"}
          width={"35px"}
          alt="logo"
          loading="lazy"
        />
      </span>

      <CircularProgress
        sx={{ width: "75px !important", height: "75px !important" }}
      /> */}
      <Box
        sx={{
          width: 260,
          height: 260,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
          <CircularProgress
            sx={{ width: "260px !important", height: "260px !important" }}
          />
          <MyComponent>
            {/* <span className="fs-4 fw-600">{"Loading.."}</span> */}
            <LoaderComponent />
          </MyComponent>
 

          {/* 
          <LinearProgress  className="mt-3"/> */}
      </Box>
    </Box>
  );
};

export default PageLoader;
