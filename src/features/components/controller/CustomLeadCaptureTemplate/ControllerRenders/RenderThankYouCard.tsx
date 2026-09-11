import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { useLeadCaptureTemplate } from "@/features/CustomLeadCapture/CustomLeadCaptureProvider";
import FooterMailIcon from "@/assets/icons/footer-mail-icon";
import FooterMobileIcon from "@/assets/icons/footer-mobile-icon";
import FooterWebsiteIcon from "@/assets/icons/footer-website-icon";
import LeadCaptureThankYouPageBg from "@/assets/icons/lead-capture-thank-you";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useEnv } from "@/features/hooks/useEnv";
import type { EnvConfig } from "@/config/env";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { Box, InputBase, Typography } from "@mui/material";

const THANK_YOU_LINE_MAX = 150;

const clampThankYouLine = (value: string): string =>
  value.slice(0, THANK_YOU_LINE_MAX);

export interface RenderThankYouCardProps {
  control?: any;
  onChange?: (value: string, optionIndex: number) => void;
  disabled?: boolean;
}

const RenderThankYouCard: React.FC<RenderThankYouCardProps> = ({
  control,
  onChange,
  disabled = false,
}) => {
  const {
    organizationName,
    facebook,
    address,
    twitter,
    linkedIn,
    instagram,
    website,
    mobileNumber,
    emailId,
  } = useOrganization();
  const { VITE_USERHUB_ENDPOINT } = useEnv() as EnvConfig;
  const { post: fetch } = useAxiosWithAuth<any>(
    VITE_USERHUB_ENDPOINT + "/myorganization",
  );
  const [logoUrl, setLogoUrl] = useState("");
  const { leadCaptureTemplateData, editMode } = useLeadCaptureTemplate();
  const { t } = useTranslation();

  const thankYouPageFromTemplate = leadCaptureTemplateData?.pages?.find(
    (page) => page.pageType === "THANK_YOU",
  );
  const options = control?.options ?? thankYouPageFromTemplate?.controller?.[0]?.options;
  const thankYouContent =
    control?.content ?? thankYouPageFromTemplate?.controller?.[0]?.content;

  const shouldShow = (value: string) => {
    return options?.find((option: { value: string }) => option.value === value)
      ?.showOrHide;
  };
  const isEditable = !disabled;
  const canOpenLinks = !editMode;

  const [focusedLineIndex, setFocusedLineIndex] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const requestData = {
        eventType: "FETCH_LOGO",
      };
      const data = await fetch(requestData);
      if (data?.code === "ORGANIZATION_LOGO_FETCH_SUCCESS") {
        setLogoUrl(data?.body?.logoUrl);
      }
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const lineValue = (index: number): string => {
    const raw = thankYouContent?.[index]?.value;
    return clampThankYouLine(
      typeof raw === "string" ? raw : String(raw ?? ""),
    );
  };

  const handleLineChange = (index: number, next: string) => {
    if (disabled) return;
    onChange?.(clampThankYouLine(next), index);
  };
  const line1Value = lineValue(0);
  const line2Value = lineValue(1);
  const [editableLines, setEditableLines] = useState<[string, string]>([
    line1Value,
    line2Value,
  ]);

  useEffect(() => {
    setEditableLines((prev) => {
      const next: [string, string] = [...prev] as [string, string];
      let hasChanged = false;

      if (focusedLineIndex !== 0 && prev[0] !== line1Value) {
        next[0] = line1Value;
        hasChanged = true;
      }
      if (focusedLineIndex !== 1 && prev[1] !== line2Value) {
        next[1] = line2Value;
        hasChanged = true;
      }

      return hasChanged ? next : prev;
    });
  }, [focusedLineIndex, line1Value, line2Value]);

  const handleEditableLineChange = (index: 0 | 1, nextValue: string) => {
    const next = clampThankYouLine(nextValue);
    setEditableLines((prev) => {
      if (prev[index] === next) {
        return prev;
      }
      const updated: [string, string] = [...prev] as [string, string];
      updated[index] = next;
      return updated;
    });
    handleLineChange(index, next);
  };

  const showFacebook = Boolean(shouldShow("Facebook"));
  const showInstagram = Boolean(shouldShow("Instagram"));
  const showTwitter = Boolean(shouldShow("Twitter"));
  const showLinkedIn = Boolean(shouldShow("LinkedIn"));

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        overflow: "hidden",
      }}
    >
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <LeadCaptureThankYouPageBg
          address={address}
          facebook={facebook}
          twitter={twitter}
          linkedin={linkedIn}
          instagram={instagram}
          website={website}
          mobileNumber={mobileNumber}
          emailId={emailId}
          organizationName={organizationName}
          width="100%"
          height="100%"
          preserveAspectRatio="xMaxYMid slice"
          style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
          showSocialIcons
          showFacebook={showFacebook}
          showInstagram={showInstagram}
          showTwitter={showTwitter}
          showLinkedIn={showLinkedIn}
          allowSocialClick={canOpenLinks}
        />

        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pt: "10%",
            pb: "5%",
            zIndex: 1,
            pointerEvents: disabled ? "none" : "auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                ml: 6,
                px: 2,
                width: "55%",
                flexWrap: "wrap",
              }}
            >
              <div style={{ backgroundColor: "transparent !important" }}>
                {shouldShow(
                  t("leadCapture.thankYouPageControllers.Organization Logo"),
                ) && (
                  <img
                    alt={t(
                      "leadCapture.thankYouPageControllers.Organization Logo",
                    )}
                    src={logoUrl}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "contain",
                    }}
                  />
                )}
                <Box sx={{ pr: 2, pt: 2, maxWidth: "100%", backgroundColor: "transparent !important" }}>
                  {isEditable ? (
                    <Box sx={{ backgroundColor: "transparent !important" }}>
                      <InputBase
                        multiline
                        fullWidth
                        minRows={1}
                        maxRows={4}
                        value={editableLines[0]}
                        onFocus={() => setFocusedLineIndex(0)}
                        onBlur={() => setFocusedLineIndex(null)}
                        onChange={(e) =>
                          handleEditableLineChange(0, e.target.value)
                        }
                        inputProps={{
                          maxLength: THANK_YOU_LINE_MAX,
                          "aria-label": t("leadCapture.thankYouDefaults.line1"),
                          spellCheck: false,
                        }}
                        sx={{
                          bgcolor: "transparent !important",
                          background: "transparent !important",
                          backgroundColor: "transparent !important",
                          border: 0,
                          boxShadow: "none",
                          py: 2,
                          alignItems: "flex-start",
                          "&&&": {
                            background: "transparent !important",
                            backgroundColor: "transparent !important",
                          },
                          "&.MuiInputBase-root": {
                            background: "transparent !important",
                            backgroundColor: "transparent !important",
                          },
                          "& .MuiInputBase-input": {
                            background: "transparent !important",
                            backgroundColor: "transparent !important",
                          },
                          "& textarea": {
                            background: "transparent !important",
                            backgroundColor: "transparent !important",
                            padding: 0,
                            resize: "none",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            overflow: "hidden",
                            fontSize: "32px",
                            fontWeight: 600,
                            lineHeight: 1.2,
                            color: "#192A3E",
                          },
                          "& textarea:focus": {
                            outline: "none",
                          },
                        }}
                      />
                      {/* <Typography variant="caption" sx={{ display: "block", px: 1.75 }}>
                        {t("leadCapture.thankYouText.characterCount", {
                          current: line1Length,
                          max: THANK_YOU_LINE_MAX,
                        })}
                      </Typography> */}
                      <InputBase
                        multiline
                        fullWidth
                        minRows={1}
                        maxRows={4}
                        value={editableLines[1]}
                        onFocus={() => setFocusedLineIndex(1)}
                        onBlur={() => setFocusedLineIndex(null)}
                        onChange={(e) =>
                          handleEditableLineChange(1, e.target.value)
                        }
                        inputProps={{
                          maxLength: THANK_YOU_LINE_MAX,
                          "aria-label": t("leadCapture.thankYouDefaults.line2"),
                          spellCheck: false,
                        }}
                        sx={{
                          bgcolor: "transparent",
                          background: "transparent !important",
                          backgroundColor: "transparent !important",
                          border: 0,
                          boxShadow: "none",
                          pb: 2,
                          alignItems: "flex-start",
                          "&&&": {
                            background: "transparent !important",
                            backgroundColor: "transparent !important",
                          },
                          "&.MuiInputBase-root": {
                            background: "transparent !important",
                            backgroundColor: "transparent !important",
                          },
                          "& .MuiInputBase-input": {
                            background: "transparent !important",
                            backgroundColor: "transparent !important",
                          },
                          "& textarea": {
                            background: "transparent !important",
                            backgroundColor: "transparent !important",
                            padding: 0,
                            resize: "none",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            overflow: "hidden",
                            fontSize: "24px",
                            fontWeight: 600,
                            lineHeight: 1.25,
                            color: "#0D1C82",
                          },
                          "& textarea:focus": {
                            outline: "none",
                          },
                        }}
                      />
                      {/* <Typography variant="caption" sx={{ display: "block", px: 1.75 }}>
                        {t("leadCapture.thankYouText.characterCount", {
                          current: line2Length,
                          max: THANK_YOU_LINE_MAX,
                        })}
                      </Typography> */}
                    </Box>
                  ) : (
                    <Box sx={{ backgroundColor: "transparent !important" }}>
                      <Typography
                        component="div"
                        sx={{
                          fontSize: "32px",
                          fontWeight: 600,
                          color: "#192A3E",
                          // px: 2,
                          py: 2,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {lineValue(0)}
                      </Typography>
                      <Typography
                        component="div"
                        sx={{
                          fontSize: "24px",
                          fontWeight: 600,
                          color: "#0D1C82",
                          // pl: 2,
                          // pr: 2,
                          pb: 2,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {lineValue(1)}
                      </Typography>
                      {lineValue(2) ? (
                        <Typography
                          component="div"
                          sx={{
                            fontSize: "20px",
                            color: "#323C47",
                            px: 2,
                            pb: 2,
                            maxWidth: "100%",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {lineValue(2)}
                        </Typography>
                      ) : null}
                    </Box>
                  )}
                </Box>
              </div>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              p: 5,
              ml: 5,
            }}
          >
            {shouldShow("Organization Number") && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  ml: 5,
                }}
              >
                <FooterMobileIcon width={"15px"} />
                &nbsp;&nbsp;{mobileNumber}
              </Box>
            )}
            {shouldShow("Organization Email") && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  ml: 5,
                }}
              >
                <FooterMailIcon width={"20px"} />
                &nbsp;&nbsp;{emailId}
              </Box>
            )}
            {shouldShow("Organization Website") && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  ml: 5,
                }}
              >
                <FooterWebsiteIcon width={"20px"} />
                &nbsp;&nbsp;{website}
              </Box>
            )}
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default RenderThankYouCard;
