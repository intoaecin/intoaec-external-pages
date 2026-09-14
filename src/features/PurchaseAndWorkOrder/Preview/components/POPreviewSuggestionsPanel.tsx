import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export type POPreviewSuggestionsPanelProps = {
  isMobile: boolean;
  structuredPoComments: any;
  t: (key: string) => string;
};

export function POPreviewSuggestionsPanel({
  isMobile,
  structuredPoComments,
  t,
}: POPreviewSuggestionsPanelProps) {
  return (
          <Grid
            sx={{
              bgcolor: "background.paper",
              borderLeft: isMobile ? "none" : "1px solid #d1d1d1",
              width: isMobile ? "100%" : "20%",
              marginTop: isMobile ? "1rem" : "7rem",
              zIndex: "1500",
              bottom: "0px",
              overflowY: "auto",
              // Space between separator and Comments label / accordion
              pl: isMobile ? 1 : 3,
              pr: 1.5,
              pt: 1,
              position: isMobile ? "relative" : "fixed",
              right: isMobile ? "auto" : "0",
              top: isMobile ? "auto" : "0",
              maxHeight: isMobile ? "400px" : "75vh",
            }}
            className={isMobile ? "" : "position-fixed r-0 t-0"}
          >
            {Object.keys(structuredPoComments ?? {}).length > 0 ? (
              <Box className="my-1" sx={{ width: "100%" }}>
                <Box className="pb-2">
                  <span className={`fw-600 ${isMobile ? "fs-8" : "fs-7"}`}>
                    {t("common.comments")}
                  </span>
                </Box>

                {Object.entries(structuredPoComments ?? {}).map(
                  ([key, value], i) => (
                    <CardContent
                      key={i}
                      sx={{
                        p: 0,
                        "&:last-child": { pb: 0 },
                        "& .MuiPaper-root": {
                          boxShadow:
                            "rgba(0, 0, 0, 0.1) 0px 0px 5px 0px, rgba(0, 0, 0, 0.1) 0px 0px 1px 0px",
                        },
                      }}
                    >
                      <Accordion>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls={`panel${i}-content`}
                          id={`panel${i}-header`}
                        >
                          <Typography
                            component="p"
                            variant="h6"
                            className="fw-500 fs-7"
                            sx={{
                              color: "info.contaxt",
                              background: "info.main",
                            }}
                          >
                            {key}
                          </Typography>
                        </AccordionSummary>

                        <AccordionDetails>
                          {(value as any[])?.map((comment: any, idx: any, arr: any) => (
                            <Box
                              sx={{
                                paddingTop: "5px",
                                display: "flex",
                                justifyContent:
                                  comment?.receiverType === "AEC"
                                    ? "flex-start"
                                    : "flex-end",
                                alignItems: "center",
                              }}
                              key={idx}
                            >
                              {comment?.receiverType === "AEC" ? (
                                <>
                                  &nbsp;
                                  <Box
                                    sx={{
                                      maxWidth: "80%",
                                      color: "white",
                                      fontSize: "12px",
                                      backgroundColor: "#00CCCC",
                                      padding: "5px",
                                      borderRadius: "8px 8px 8px 0px",
                                    }}
                                  >
                                    {comment?.comments}
                                  </Box>
                                </>
                              ) : (
                                <>
                                  <Box
                                    sx={{
                                      maxWidth: "80%",
                                      backgroundColor: "#3CA2FF",
                                      fontSize: "12px",
                                      color: "white",
                                      padding: "5px",
                                      borderRadius: "8px 8px 0px 8px",
                                    }}
                                  >
                                    {comment?.comments}
                                  </Box>
                                  &nbsp;
                                </>
                              )}
                            </Box>
                          ))}
                        </AccordionDetails>
                      </Accordion>
                    </CardContent>
                  )
                )}
              </Box>
            ) : (
              <Typography
                width={"100%"}
                variant="body2"
                textAlign={"center"}
                my={2}
                sx={{ fontSize: isMobile ? "0.75rem" : "0.875rem" }}
              >
                {t("common.noSuggestions")}
              </Typography>
            )}
          </Grid>

  );
}
