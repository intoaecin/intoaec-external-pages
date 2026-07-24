import NextImage from "@/features/components/NextImage";
import { Box, Typography } from "@mui/material";
import React from "react";
import { Material } from "./BoqExport";
import NoPortfolioImage from "@/assets/icons/no-portfolio-image";

export interface BoqMaterialPropsTypes {
  // data: NotificationDataTypes[];
  materialData: Material;
  materialFontSize?: string;
  brandFontSize?: string;
  Responsive?: boolean;
  type?: "CLIENT" | "ADMIN";
}
const BoqMaterialCard = ({
  materialData,
  materialFontSize,
  brandFontSize,
  Responsive,
  type,
}: BoqMaterialPropsTypes) => {
  return (
    <>
      {materialData?.materialName ? (
        <Box
          sx={{
            background: "#fff",
            // boxShadow: " 0px 0px 5px 0px rgba(0, 0, 0, 0.5);",
            boxShadow: " 4px 4px 10px 0px rgb(0 0 0 / 5%);",
            borderRadius: "15px",
            width: Responsive
              ? { xs: "125px", sm: "125px", md: "125px" }
              : "125px",
            // maxWidth: Responsive
            //   ? type == "CLIENT"
            //     ? { xs: "150px", sm: "50%", md: "10%" }
            //     : { xs: "150px", sm: "50%", md: "13%" }
            //   : "200px",

            height: Responsive
              ? { xs: "125px", sm: "125px", md: "125px" }
              : "125px",
            paddingBlock: ".7rem",
            alignSelf: "stretch",
          }}
          className="d-flex flex-wrap m-2 m-sm-0 px-2  justify-content-center align-items-center"
        >
          <Box
            className="d-flex justify-content-center align-items-center"
            sx={{
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                width: {
                  xs: "70%",
                  md: "80%",
                },
              }}
              className="d-flex  justify-content-center align-items-center"
            >
              {materialData?.materialImage ? (
                <img
                  src={materialData?.materialImage}
                  width={"100%"}
                  height={"100%"}
                  alt="material image"
                />
              ) : (
                //   <img
                //   src={""}
                //   width={100} height={100}
                //   alt="no material image found"
                // />
                // <NoPortfolioImage width={100} height={50} />
                <div></div>
              )}
            </Box>
            <Typography
              component={"p"}
              className="fw-500  text-center"
              sx={{
                fontSize: `${materialFontSize ? materialFontSize : "0.9rem"}`,
                marginTop: ".5rem",
                paddingBlock: ".2rem",
                textWrap: "wrap",
              }}
            >
              {materialData?.materialName}
            </Typography>
            {materialData?.materialBrandName && (
              <Typography
                className=" text-center"
                sx={{
                  fontSize: `${brandFontSize ? brandFontSize : "0.5rem"}`,
                  paddingBlock: ".2rem",
                }}
              >
                Brand:{" "}
                <Typography
                  component={"span"}
                  className="fw-600 "
                  sx={{
                    fontSize: `${brandFontSize ? brandFontSize : "0.5rem"}`,
                  }}
                >
                  {materialData?.materialBrandName}
                </Typography>
              </Typography>
            )}
          </Box>
        </Box>
      ) : (
        <></>
      )}
    </>
  );
};

export default BoqMaterialCard;
