import ProposalLeadCommentsIcon from "@/assets/icons/proposalLeadComments-icon";
import { ProposalPageType, SuggestionType } from "@/types";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SendIcon from "@mui/icons-material/Send";
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
  useThemeProps,
} from "@mui/material";
import axios from "axios";
import { useEnv } from "@/features/hooks/useEnv";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { InView, useInView } from "react-intersection-observer";
import NextImage from "../NextImage";
import RenderCheckbox from "../controller/Proposal/ControllerRenderers/RenderCheckbox";
import RenderDivider from "../controller/Proposal/ControllerRenderers/RenderDivider";
import RenderImage from "../controller/Proposal/ControllerRenderers/RenderImage";
import RenderPricingTable from "../controller/Proposal/ControllerRenderers/RenderPricingTable";
import { RenderSignature } from "../controller/Proposal/ControllerRenderers/RenderSignature";
import RenderTable from "../controller/Proposal/ControllerRenderers/RenderTable";
import RenderTermsandCondition from "../controller/Proposal/ControllerRenderers/RenderTermsandCondition";
import RenderText from "../controller/Proposal/ControllerRenderers/RenderText";
import RenderShape from "../controller/Proposal/ControllerRenderers/RenderShape";
import { CommentPopup } from "./CommentPopup";
import PreviewProposalPageSection from "./PreviewProposalPageSection";
import { RenderOrganizationLogo } from "../controller/Proposal/ControllerRenderers/RenderOrganizationLogo";
import { useTranslation } from "react-i18next";
const LeadCommentThreadComponent = ({
  comment,
  commentPinIndex,
  commentPin,
}: {
  comment: any;
  commentPinIndex: any;
  commentPin: any;
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box
      className="card my-2    "
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        justifyContent: "center",
        // bgcolor:
        //   comment.accepted == true
        //     ? "#fff"
        //     : comment.accepted == false
        //     ? "rgba(239,83,80,0.5)"
        //     : "none",
      }}
    >
      <Box className="d-flex justify-content-between align-items-center px-1">
        <div className="d-flex align-items-center">
          <ChatBubbleIcon
            sx={{ width: "23px", height: "23px", fill: "#909090" }}
          />
          <span
            className="position-relative fs-8"
            style={{ top: "-1px", left: "-15px", color: "#ffffff" }}
          >
            {commentPin}
          </span>
          <span>{t("reasons.you")}</span>
          {comment.accepted == true && (
            <span
              className="fs-8 ml-2 d-flex align-items-center px-1"
              style={{
                background: theme?.palette?.success?.main,
                color: "#fff",
                borderRadius: "4px",
              }}
            >
              <CheckCircleOutlinedIcon
                className="mr-1"
                style={{ width: "12px", height: "12px" }}
              />
              {"Accepted"}
            </span>
          )}

          {comment.accepted == false && (
            <span
              className="fs-8 ml-2 d-flex align-items-center px-1"
              style={{
                background: "#c62828 ",
                color: "#fff",
                borderRadius: "4px",
              }}
            >
              <CancelOutlinedIcon
                className="mr-1"
                style={{ width: "12px", height: "12px" }}
              />
              {"Denied"}
            </span>
          )}
        </div>
        <div>
          <span style={{ color: "#d1d1d1" }}>{"#" + commentPinIndex}</span>
        </div>
      </Box>

      <Typography style={{ fontSize: "0.85rem" }} className="fw-500 px-1">
        {comment?.suggestion?.value}
      </Typography>
      {comment?.reasonThread?.reason && (
        <Box className="py-2 px-1 mt-1" sx={{ background: "#f9f9f9" }}>
          <Box className="d-flex align-items-center mb-1">
            <NextImage
              src={"/images/userImage.png"}
              width={"20px"}
              height="20px"
              alt={""}
            />
            <span className="ml-1 fw-500">{t("reasons.architect")}</span>
          </Box>
          <Typography className="ml-2 pl-1" style={{ fontSize: "0.75rem" }}>
            {comment?.reasonThread?.reason}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
const ArchitectCommentThreadComponent = ({
  comment,
  onAccept,
  onChangeReason,
  onDeny,
  commentPinIndex,
  commentPin,
}: {
  comment: any;
  onAccept?: () => void;
  onDeny?: () => void;
  onChangeReason?: (reason: string) => void;
  commentPinIndex: any;
  commentPin: any;
}) => {
  const [reason, setReason] = useState<string>(comment?.reasonThread?.reason);
  const [editReason, setEditReason] = useState(
    comment?.reasonThread?.reason == null ? true : false
  );
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Box sx={{ p: 2 }}>
      <Box>
        <Box className="d-flex justify-content-between align-items-center px-1">
          <div className="d-flex align-items-center">
            <ChatBubbleIcon
              sx={{ width: "23px", height: "23px", fill: "#909090" }}
            />
            <span
              className="position-relative fs-8"
              style={{ top: "-1px", left: "-15px", color: "#ffffff" }}
            >
              {commentPin}
            </span>
            <span>{"Lead"}</span>
            {comment.accepted == true && (
              <span
                className="fs-8 ml-2 d-flex align-items-center px-1"
                style={{
                  background: theme?.palette?.success?.main,
                  color: "#fff",
                  borderRadius: "4px",
                }}
              >
                <CheckCircleOutlinedIcon
                  className="mr-1"
                  style={{ width: "12px", height: "12px" }}
                />
                {"Accepted"}
              </span>
            )}

            {comment.accepted == false && (
              <span
                className="fs-8 ml-2 d-flex align-items-center px-1"
                style={{
                  background: "#c62828 ",
                  color: "#fff",
                  borderRadius: "4px",
                }}
              >
                <CancelOutlinedIcon
                  className="mr-1"
                  style={{ width: "12px", height: "12px" }}
                />
                {"Denied"}
              </span>
            )}
          </div>
          <div>
            <span style={{ color: "#d1d1d1" }}>{"#" + commentPinIndex}</span>
          </div>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography style={{ fontSize: "0.85rem" }} className="fw-500 px-1">
          {comment?.suggestion?.value}
        </Typography>
      </Box>
      <Box className="mt-1">
        {editReason ? (
          <TextField
            multiline
            placeholder="Reply"
            variant="outlined"
            fullWidth
            onChange={(e) => {
              setReason(e.target.value);
            }}
            value={reason}
            disabled={!editReason}
            sx={{ borderRadius: "50%" }}
            // InputProps={{
            //   endAdornment: (
            //     <InputAdornment position="end">
            //       {editReason ? (
            //         <IconButton
            //           disabled={!reason}
            //           onClick={() => {
            //             if (reason) {
            //               onChangeReason?.(reason);
            //               setEditReason(false);
            //             }
            //           }}
            //         >
            //           <SendIcon />
            //         </IconButton>
            //       ) : (
            //         <IconButton
            //           onClick={() => {
            //             setEditReason(true);
            //           }}
            //         >
            //           <EditRoundedIcon />
            //         </IconButton>
            //       )}
            //     </InputAdornment>
            //   ),
            // }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    disabled={!reason}
                    onClick={() => {
                      if (reason) {
                        onChangeReason?.(reason);
                        setEditReason(false);
                      }
                    }}
                    sx={{
                      svg: {
                        fill: "#32acff",
                      },
                      ":disabled": {
                        svg: {
                          fill: "#d1d1d1",
                          opacity: "0.5",
                        },
                      },
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        ) : (
          <Box>
            <Box className="py-2 px-1 mt-1" sx={{ background: "#f9f9f9" }}>
              <Box className="d-flex align-items-center mb-1">
                <NextImage
                  src={"/images/userImage.png"}
                  width={"20px"}
                  height="20px"
                  alt={""}
                />
                <span className="ml-1 fw-500">{t("reasons.you")}</span>
              </Box>
              <Typography className="ml-2 pl-1" style={{ fontSize: "0.75rem" }}>
                {reason}
              </Typography>
            </Box>
            <IconButton
              className="btnPrimaryUI   mt-2"
              sx={{
                borderRadius: "4px",
                height: "32px !important",
                width: "100% !important",
              }}
              onClick={() => {
                setEditReason(true);
              }}
            >
              <EditRoundedIcon style={{ width: "18px", height: "18px" }} />
              <span style={{ fontSize: "0.85rem" }} className=" ml-1">
                {"Edit Comment"}
              </span>
            </IconButton>
          </Box>
        )}
      </Box>

      <Box className="d-flex align-items-center justify-content-between">
        <Button
          className="btnSuccessUI my-1 mr-1"
          sx={{
            height: "32px !important",
            width: "100% !important",
          }}
          disabled={comment?.accepted === true}
          onClick={() => {
            onAccept?.();
          }}
          color="success"
        >
          <span style={{ fontSize: "0.85rem" }}>{"Accept"}</span>
          <CheckCircleRoundedIcon
            className="ml-1"
            style={{ width: "18px", height: "18px", fill: "#FFF" }}
          />
        </Button>
        <Button
          className="btnErrorUI"
          sx={{
            height: "32px !important",
            width: "100% !important",
          }}
          disabled={comment?.accepted === false}
          onClick={() => {
            onDeny?.();
          }}
          color="error"
        >
          <span style={{ fontSize: "0.85rem" }}>{"Denied"}</span>
          <CancelRoundedIcon
            className="ml-1"
            style={{ width: "18px", height: "18px", fill: "#FFF" }}
          />
        </Button>
      </Box>
    </Box>
  );
};
const controllersToEnableComments = [
  "TEXT",
  "IMAGE",
  "SHAPE",
  "PRICING_TABLE",
  "TERMS_AND_CONDITIONS",
  "TABLE",
];

const renderPreviewController = (
  controller: any,
  organizationId: string,
  organizationType: string,
  leadSignatureUrl?: string,
  cameraVerificationUrl?: string
) => {
  // * used to hide the empty text value in controller
  if (controller?.controllerName === "TEXT") {
    if (controller?.value?.length === 1) {
      const isEmpty = controller?.value?.every?.(
        (node: any) =>
          !node?.children?.some?.((child: any) => child?.text?.trim())
      );
      if (isEmpty) {
        return;
      }
    } else if (!controller?.value?.length) {
      return;
    }
  }

  switch (controller.controllerName) {
    case "IMAGE":
      return <RenderImage controller={controller} />;
    case "TEXT":
      return <RenderText controller={controller} />;
    case "SHAPE":
      return <RenderShape controller={controller} />;
    case "DIVIDER":
      return <RenderDivider controller={controller} />;
    case "CHECKBOX":
      return <RenderCheckbox controller={controller} />;
    case "SIGNATURE":
      return (
        <RenderSignature
          organizationId={organizationId}
          organizationType={organizationType}
          controller={controller}
          leadSignatureUrl={leadSignatureUrl}
          cameraVerificationUrl={cameraVerificationUrl}
        />
      );
    case "TABLE":
      return <RenderTable controller={controller} />;
    case "PRICING_TABLE":
      return <RenderPricingTable controller={controller} />;
    case "TERMS_AND_CONDITIONS":
      return <RenderTermsandCondition controller={controller} />;
    case "ORGANIZATION_LOGO":
      return (
        <RenderOrganizationLogo
          controller={controller}
          organizationId={organizationId}
        />
      );
    // case "IMPORT_PDF":
    //   return <RenderTermsandCondition controller={controller} />;
    default:
      return <></>;
  }
};
const PageComponent = ({
  page,
  pageIndex,
  organizationId,
  organizationType,
  leadProposalId,
  proposalRevision,
  trackAnalytics,
  commentMode,
  setControllerComments,
  controllerComments,
  type,
  leadSignatureUrl,
  cameraVerificationUrl,
  userDesignation,
  userId,
  userName,
  allowComments,
}: {
  organizationId: string;
  organizationType: string;
  pageIndex: number;
  page: ProposalPageType;
  leadProposalId: string;
  proposalRevision: any;
  trackAnalytics?: boolean;
  commentMode?: boolean;
  setControllerComments?: Dispatch<any>;
  controllerComments: any;
  type: "LEAD" | "ADMIN";
  leadSignatureUrl?: string;
  cameraVerificationUrl?: string;
  userId?: string;
  userDesignation?: string;
  userName?: string;
  allowComments?: boolean;
}) => {
  const timer = useRef<any>();
  const startTimeRef = useRef<number | null>(null);
  const { t } = useTranslation();
  const { VITE_AEC_PORTAL_URL } = useEnv();
  const [refff, inView] = useInView({
    triggerOnce: false,
    threshold: 0.5,
  });

  const commentPopupRef = useRef<any>();
  const [hoveredController, setHoveredController] = useState<string>();

  const clearTimer = () => {
    clearInterval(timer.current);

    if (startTimeRef.current !== null) {
      const endTime = Date.now();
      const elapsed = Math.floor((endTime - startTimeRef.current) / 1000);
      if (trackAnalytics) {
        axios.post(`${VITE_AEC_PORTAL_URL}/api/add-to-queue`, {
          eventType: "REGISTER_PROPOSAL_ANALYTICS",
          leadProposalId,
          proposalRevision: proposalRevision,
          pageId: page.pageId,
          pageName: page.pageName,
          timeSpent: elapsed ?? 0,
        });
        startTimeRef.current = null;
      }
    }

    // console.log("Timer cleared");
  };

  const handlePageViewChange = () => {
    if (inView) {

      if (trackAnalytics) {
        axios.post(`${VITE_AEC_PORTAL_URL}/api/add-to-queue`, {
          eventType: "REGISTER_PROPOSAL_ANALYTICS",
          leadProposalId,
          proposalRevision: proposalRevision,
          pageIndex,
          pageId: page.pageId,
          pageName: page.pageName,
          viewed: 1,
        });
        startTimeRef.current = Date.now();
        timer.current = setInterval(() => {
        }, 1000);
      }
    } else {
      // console.log("PAGE VIEW:OUT", pageIndex);
      clearTimer();
    }
  };
  useEffect(() => {
    handlePageViewChange();
  }, []);
  useEffect(() => {
    handlePageViewChange();

    const handleFocus = () => {
      handlePageViewChange();
    };

    const handleBlur = () => {
      clearTimer();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      clearTimer();
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [inView, pageIndex, trackAnalytics, leadProposalId, page]);

  return (
    <>
      <CommentPopup
        onChange={(controllerId, text) => {
          setControllerComments?.((prev: any) => ({
            ...prev,
            [page.pageId]: {
              ...prev?.[page.pageId],
              [controllerId]: [
                ...(prev?.[page.pageId]?.[controllerId] ?? []),
                {
                  suggestion: {
                    ...(prev?.[controllerId]?.suggestion ?? {}),
                    value: text,
                  },
                },
              ],
            },
          }));
          // console.log(controllerId, text);
        }}
        type="LEAD"
        ref={commentPopupRef}
      />
      <InView key={page.pageId}>
        {({ inView, ref, entry }) => (
          <Grid
            ref={refff}
            className="d-flex justify-content-center px-md-1 px-lg-3  "
            key={"preview-proposal-template-" + page.pageId}
            sx={{
              ":first-child": {
                marginTop: {
                  xs: "5px",
                  sm: "40px",
                },
              },
              ":last-child": {
                marginBottom: {
                  xs: "10px",
                  sm: "60px",
                },
              },
            }}
          >
            <Box
              className="d-flex column justify-content-center align-items-center    "
              sx={{
                width: {
                  xs: commentMode ? "50%" : "100%",
                  sm: "100%",
                },
              }}
            >
              <Box
                id={"preview-proposal-template-" + page.pageId}
                // key={pageIndex}
                sx={{
                  // width: 300,
                  width: {
                    xs: "100%",
                    sm: 793.700787,
                  },

                  "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                    backgroundColor: {
                      xs: "#ffff",
                      sm: "#D3D3D3",
                    },
                  },
                  "&::-webkit-scrollbar-thumb:horizontal, & *::-webkit-scrollbar-thumb:horizontal":
                    {
                      backgroundColor: "#D3D3D3",
                    },
                  height: 1122.519685,
                  border: "1px solid #ddd",
                  position: "relative",
                  background: "#fff",
                  backgroundSize: "contain",
                  // backgroundImage: page?.backgroundImage
                  //   ? `url(${page?.backgroundImage})`
                  //   : "",
                  overflowX: "hidden",
                  overflowY: "hidden",
                  "& .react-draggable": {
                    overflow: "inherit !important",
                  },
                }}
                className="  "
              >
                {page?.backgroundImage && (
                  <img
                    src={page?.backgroundImage}
                    height={"100%"}
                    width={"100%"}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      zIndex: pageIndex,
                    }}
                  />
                )}
                {page?.controllers?.map(
                  (controller: any, controllerIndex: number) => {
                    const shouldShowLeadCameraVerification =
                      controller?.controllerName === "SIGNATURE" &&
                      controller?.signatureType !== "ADMIN" &&
                      Boolean(cameraVerificationUrl);

                    return (
                      <Box
                        key={page?.pageId + "controller" + controllerIndex}
                        component={"div"}
                        style={{
                          zIndex: (pageIndex + 1) * 10 + controllerIndex,
                          overflow: shouldShowLeadCameraVerification
                            ? "visible"
                            : "hidden",
                          // width: 280,

                          width: controller?.style?.width,
                          height: controller?.style?.height,
                          position: "absolute",
                          left: controller?.x,
                          top: controller?.y,
                          ...(controller?.controllerId === hoveredController
                            ? {
                                border: "3px solid #1976d2",
                                borderRadius: 5,
                                boxShadow:
                                  "rgb(25, 118, 210) 1px 1px 6px 1px",
                              }
                            : {
                                border: "none",
                              }),
                        }}
                        sx={{
                          ":hover":
                            allowComments !== false &&
                            commentMode &&
                            type === "LEAD" &&
                            controllersToEnableComments.includes(
                              controller?.controllerName
                            )
                              ? {
                                  visibility: "hidden",
                                  "& .commentNotifier": {
                                    visibility: "visible",
                                  },
                                }
                              : {},
                        }}
                      >
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
                            height: "91%",
                            width: "92%",
                            backgroundImage: ` url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='lightGrey' stroke-width='3' stroke-dasharray='4%2c14' stroke-dashoffset='24' stroke-linecap='square'/%3e%3c/svg%3e")`,
                            bgcolor: "background.paper",
                            textAlign: "center",
                            visibility: "hidden",
                            alignItems: "center",
                            verticalAlign: "center",
                          }}
                          component={"div"}
                          onClick={(e) => {
                            commentPopupRef?.current?.handleOpen(
                              e.currentTarget,
                              controller?.controllerId
                            );
                          }}
                        >
                          <Button variant="outlined">
                            <ProposalLeadCommentsIcon
                              style={{ width: "20px", height: "20px" }}
                            />
                            <span className="fw-500 ml-1">
                              {"Add Suggestions"}
                            </span>
                          </Button>
                          {/* <ProposalLeadClicks className="mr-2" style={{width:'30px',height:'30px'}}/>
                        <span className="fw-500 ">{'Double click to add suggestion'}</span> */}
                        </Typography>
                        {renderPreviewController(
                          controller,
                          organizationId,
                          organizationType,
                          leadSignatureUrl,
                          cameraVerificationUrl
                        )}
                      </Box>
                    );
                  }
                )}
              </Box>
            </Box>
            {allowComments !== false && commentMode && (
              <Grid
                sx={{
                  bgcolor: "background.paper",
                  maxHeight: 1122.519685,
                  width: {
                    xs: "50%",
                    sm: "30%",
                  },
                  borderLeft: {
                    xs: "1px solid #ddd",
                    sm: "none",
                  },
                  zIndex: 1000,
                }}
                className=" mt-4 "
              >
                {Object?.values(controllerComments?.[page.pageId] ?? {})
                  ?.length == 0 && (
                  <Typography
                    width={"100%"}
                    variant="body2"
                    textAlign={"center"}
                    my={2}
                  >
                    {t("common.noSuggestions")}
                  </Typography>
                )}
                {controllerComments?.[page.pageId] &&
                  Object.entries(controllerComments?.[page.pageId]).map(
                    ([key, comments]: any, index: any) => (
                      <Box
                        key={key}
                        component={"div"}
                        sx={{ cursor: "pointer" }}
                        onMouseEnter={() => {
                          setHoveredController(key);
                        }}
                        onMouseLeave={() => {
                          setHoveredController(undefined);
                        }}
                      >
                        {comments?.map((comment: any, commentIndex: number) =>
                          type == "LEAD" ? (
                            <LeadCommentThreadComponent
                              comment={comment}
                              key={key + "-" + commentIndex}
                              commentPin={index + 1}
                              commentPinIndex={commentIndex + 1}
                            />
                          ) : (
                            <ArchitectCommentThreadComponent
                              comment={comment}
                              key={key + "-" + commentIndex}
                              commentPin={index + 1}
                              commentPinIndex={commentIndex + 1}
                              onChangeReason={(reason) => {
                                setControllerComments?.((prev: any) => ({
                                  ...prev,
                                  [page.pageId]: {
                                    ...prev?.[page.pageId],
                                    [key]: [
                                      ...comments.slice(0, commentIndex),
                                      {
                                        ...comment,
                                        reasonThread: {
                                          ...comment?.reasonThread,
                                          userId,
                                          userDesignation,
                                          userName,
                                          reason,
                                        },
                                      },
                                      ...comments.slice(commentIndex + 1),
                                    ],
                                  },
                                }));
                              }}
                              onAccept={() => {
                                setControllerComments?.((prev: any) => ({
                                  ...prev,
                                  [page.pageId]: {
                                    ...prev?.[page.pageId],
                                    [key]: [
                                      ...comments.slice(0, commentIndex),
                                      {
                                        ...comment,
                                        accepted: true,
                                      },
                                      ...comments.slice(commentIndex + 1),
                                    ],
                                  },
                                }));
                              }}
                              onDeny={() => {
                                setControllerComments?.((prev: any) => ({
                                  ...prev,
                                  [page.pageId]: {
                                    ...prev?.[page.pageId],
                                    [key]: [
                                      ...comments.slice(0, commentIndex),
                                      {
                                        ...comment,
                                        accepted: false,
                                      },
                                      ...comments.slice(commentIndex + 1),
                                    ],
                                  },
                                }));
                              }}
                            />
                          )
                        )}
                        <Divider />
                      </Box>
                    )
                  )}
              </Grid>
            )}
          </Grid>
        )}
      </InView>
    </>
  );
};

const PreviewProposal = ({
  pageData,
  trackAnalytics,
  organizationId,
  organizationType,
  commentMode,
  leadProposalId,
  proposalRevision,
  setCommentMode,
  setControllerComments,
  controllerComments,
  leadSignatureUrl,
  cameraVerificationUrl,
  type,
  allowComments,
}: {
  organizationId?: string;
  organizationType?: string;
  pageData: Array<ProposalPageType>;
  trackAnalytics?: boolean;
  commentMode?: boolean;
  leadProposalId?: string;
  proposalRevision?: any;
  setCommentMode?: Dispatch<SetStateAction<boolean>>;
  setControllerComments?: Dispatch<SetStateAction<SuggestionType | undefined>>;
  controllerComments?: any;
  leadSignatureUrl?: string;
  cameraVerificationUrl?: string;
  type: "ADMIN" | "LEAD";
  allowComments?: boolean;
}) => {
  return (
    <div
      style={{
        background: "#f1f1f1",
        height: "100%",
        minHeight: 0,
        display: "flex",
        overflow: "hidden",
        flex: 1,
      }}
    >
      {type == "ADMIN" && (
        <div
          style={{
            width: "16.666667%",
            flexShrink: 0,
            minHeight: 0,
            height: "100%",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <PreviewProposalPageSection
            pages={pageData}
            leadProposalId={leadProposalId}
          />
        </div>
      )}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          width: type == "ADMIN" ? undefined : "100%",
          overflowX: "hidden",
          overflowY: "auto",
        }}
        className="border proposal-preview-container"
      >
        {pageData?.map((page: any, pageIndex: any) => (
          <PageComponent
            key={page.pageId}
            page={page}
            organizationId={organizationId || ""}
            organizationType={organizationType || ""}
            pageIndex={pageIndex}
            trackAnalytics={trackAnalytics}
            commentMode={commentMode}
            allowComments={allowComments}
            leadProposalId={leadProposalId ?? ""}
            proposalRevision={proposalRevision ?? ""}
            setControllerComments={setControllerComments}
            controllerComments={controllerComments}
            type={type}
            leadSignatureUrl={leadSignatureUrl}
            cameraVerificationUrl={cameraVerificationUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default PreviewProposal;
