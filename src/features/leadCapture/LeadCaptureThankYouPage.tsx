import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { useEnv } from "@/features/hooks/useEnv";
import FacebookIcon from "@/assets/icons/facebook-icon";
import FooterMailIcon from "@/assets/icons/footer-mail-icon";
import FooterMobileIcon from "@/assets/icons/footer-mobile-icon";
import FooterWebsiteIcon from "@/assets/icons/footer-website-icon";
import InstagramIcon from "@/assets/icons/instagram-icon";
import LeadCaptureThankYouPageBg from "@/assets/icons/lead-capture-thank-you";
import LinkedInIcon from "@/assets/icons/linkedIn-icon";
import LocationIcon from "@/assets/icons/location-icon";
import MapImageIcon from "@/assets/icons/mapImage";
import ProjectLocationIcon from "@/assets/icons/project-location-icon";
import TwitterIcon from "@/assets/icons/twitter-icon";
import {
  Box,
  Button,
  Fade,
  Paper,
  Popper,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const LeadCaptureThankYouPage = () => {
  const { push } = useRouter();
  const router = useRouter();
  const iconContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    transform: "rotate(-45deg)",
    marginTop: "2rem",
  };

  const iconStyle: React.CSSProperties = {
    transform: "rotate(45deg)",
    marginBottom: "1rem",
  };
  const projectLocationIconRef = useRef<any>({});
  const { VITE_INTOAEC_LOGO } = useEnv();
  const org = useOrganization();

  const getRedirectQuery = router.query.redirect;
  const { t } = useTranslation();
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          zIndex: -1,
          minWidth: "100vw",
          minHeight: "100vh",
        }}
      >
        {/* LeadCaptureThankYouPageBg rendered behind everything */}
        <LeadCaptureThankYouPageBg
          address={org?.address}
          facebook={org?.facebook}
          twitter={org?.twitter}
          linkedin={org?.linkedIn}
          instagram={org?.instagram}
          website={org?.website}
          mobileNumber={org?.mobileNumber}
          emailId={org?.emailId}
          organizationName={org?.organizationName}
          width={"100vw"}
        />
      </div>
      <div
        className="d-flex column justify-content-between"
        style={{
          // backgroundImage: 'url("/images/Thank you page.svg")',
          position: "absolute",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          height: "100vh",
        }}
      >
        <div></div>
        <div className="d-flex justify-content-between align-items-center">
          <div className=" d-flex ml-6 px-2" style={{ width: "40vw" }}>
            <div>
              <img
                alt="Remy Sharp"
                src={org?.logoUrl}
                style={{
                  width: "250px",
                  height: "200px",
                }}
              />
              <div
                style={{
                  fontSize: "40px",
                  fontWeight: 600,
                  color: "#192A3E",
                  padding: "30px",
                }}
              >
                {t("leadCapture.thanksForSharing")}
                <br />{" "}
                <span
                  style={{
                    fontSize: "50px",
                    fontWeight: 600,
                    color: "#0D1C82",
                  }}
                >
                  {t("leadCapture.yourDetails")}
                </span>
              </div>
              <div
                style={{
                  fontSize: "20px",
                  color: "#323C47",
                  padding: "30px",
                  maxWidth: "30vw",
                }}
              >
                {t(
                  "leadCapture.weAreOnItAndWillBeInTouchShortlyToMakeYourVisionAReality"
                )}
              </div>
              {getRedirectQuery && getRedirectQuery !== "" && (
                <div style={{ padding: "0 30px" }}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      router.push(getRedirectQuery as string);
                    }}
                  >
                    {t("common.backToPortal")}
                  </Button>
                </div>
              )}
            </div>
          </div>
          {/* <div style={iconContainerStyle}>
          <div style={iconStyle}>
            <FacebookIcon width={"90px"} />
          </div>
          <div style={iconStyle}>
            <TwitterIcon width={"80px"} />
          </div>
          <div style={iconStyle}>
            <LinkedInIcon width={"80px"} />
          </div>
          <div style={iconStyle}>
            <InstagramIcon width={"80px"} />
          </div>
        </div> */}
        </div>

        <div className="d-flex justify-content-start  p-5  ml-5">
          <div className="d-flex justify-content-start align-items-center ml-5">
            <FooterMobileIcon width={"15px"} />
            &nbsp;&nbsp;{org?.mobileNumber}
          </div>
          <div className="d-flex justify-content-start align-items-center ml-5">
            <FooterMailIcon width={"20px"} />
            &nbsp;&nbsp;{org?.emailId}
          </div>
          <div className="d-flex justify-content-start align-items-center ml-5">
            {org?.website && (
              <>
                <FooterWebsiteIcon width={"20px"} />
                &nbsp;&nbsp;{org?.website}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadCaptureThankYouPage;
