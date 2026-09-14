import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { ProposalLeadCommentsIcon } from "intoaec-react-icons";
import PlateEditor from "@/components/plate-editor";
import { PlateContentStatic } from "@/components/PlateContentStatic";
import { PlateProvider } from "@/features/components/providers/PlateProvider";

export type POPreviewTermsSectionProps = {
  data: any;
  pdf?: boolean;
  isMobile: boolean;
  commentMode?: boolean;
  hoveredTermsAndCondition: boolean;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  commentPopupRef: React.MutableRefObject<any>;
  resolvedDefaultTermsAndConditionData: any;
  termsAndConditionData: any;
  t: (key: string) => string;
};

export function POPreviewTermsSection(props: POPreviewTermsSectionProps) {
  const {
    data,
    pdf,
    isMobile,
    commentMode,
    hoveredTermsAndCondition,
    handleMouseEnter,
    handleMouseLeave,
    commentPopupRef,
    resolvedDefaultTermsAndConditionData,
    termsAndConditionData,
    t,
  } = props;
  return (
              <Box
                id="poTermsAndCondition"
                sx={{
                  minHeight: pdf ? "auto" : isMobile ? "200px" : "400px",
                }}
                className={`${isMobile ? "pl-1 py-1 px-1" : "pl-2 py-2 px-2"}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Box className="pb-2">
                  <span className={`fw-600 ${isMobile ? "fs-8" : "fs-7"}`}>
                    {pdf
                      ? "Terms And Conditions"
                      : t("common.termsAndConditions")}
                  </span>
                </Box>
                <Box>
                  {commentMode && hoveredTermsAndCondition ? (
                    <Typography
                      className="commentNotifier d-flex justify-content-center"
                      variant="body2"
                      sx={{
                        position: "absolute",
                        zIndex: 5,
                        px: 1,
                        userSelect: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        height: isMobile ? "0px" : "300px",
                        width: isMobile ? "90%" : "70%",
                        backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='lightGrey' stroke-width='3' stroke-dasharray='4%2c14' stroke-dashoffset='24' stroke-linecap='square'/%3e%3c/svg%3e")`,
                        bgcolor: "background.paper",
                        textAlign: "center",
                        visibility: "visible",
                        alignItems: "center",
                        display: "flex",
                        justifyContent: "center",
                      }}
                      component={"div"}
                      onClick={(e) => {
                        commentPopupRef?.current?.handleOpen(
                          e.currentTarget,
                          "termsAndCondition"
                        );
                      }}
                    >
                      <Button
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                      >
                        <ProposalLeadCommentsIcon
                          style={{
                            width: isMobile ? "16px" : "20px",
                            height: isMobile ? "16px" : "20px",
                          }}
                        />
                        <span
                          className={`fw-500 ${isMobile ? "ml-0" : "ml-1"} ${isMobile ? "fs-7" : ""
                            }`}
                        >
                          {"Add Suggestions"}
                        </span>
                      </Button>
                    </Typography>
                  ) : pdf ? (
                    <PlateContentStatic
                      value={
                        resolvedDefaultTermsAndConditionData
                          ? resolvedDefaultTermsAndConditionData
                          : termsAndConditionData || undefined
                      }
                    />
                  ) : (
                    <PlateProvider>
                      <PlateEditor
                        editorHeight={isMobile ? "200px" : "400px"}
                        id={data?.poId}
                        value={
                          resolvedDefaultTermsAndConditionData
                            ? resolvedDefaultTermsAndConditionData
                            : termsAndConditionData || undefined
                        }
                        readOnly
                        placeHolder={""}
                      />
                    </PlateProvider>
                  )}
                </Box>
              </Box>
  );
}
