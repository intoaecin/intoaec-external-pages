import { Button, Card } from "@mui/material";
import React from "react";
import QuestionnaireLinkExpiredIcon from "@/assets/icons/questionnaire-link-exp-icon";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

const EstimateLinkExpired = () => {
  const router = useRouter();
  const getRedirectQuery = router.query.redirect;
  const { t } = useTranslation();
  return (
    <div
      style={{
        backgroundImage: 'url("/images/QuestionnaireLinkBg.svg")',
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        style={{
          display: "flex",

          justifyContent: "center",
          height: "100vh",
          borderRadius: "10px",
          position: "relative",
        }}
      >
        {getRedirectQuery && getRedirectQuery !== "" && (
          <Button
            sx={{ position: "absolute", top: "10px", right: "20px" }}
            onClick={() => {
              router.push(getRedirectQuery as string);
            }}
            className="btnSuccessUI"
          >
            {t("common.backToPortal")}
          </Button>
        )}
        {/* <div
          style={{
            display: "flex",
            flexDirection: "row-reverse",
            color: "#318CE7",
            margin: "1rem 2rem",
          }}
        >
          What's New?
        </div> */}

        <div
          style={{
            display: "flex",
            justifyContent: "center",

            alignItems: "center",
          }}
        >
          <Card className="user-invite-verified">
            <div
              className="user-invite-zigzagbg"
              style={{
                backgroundImage: 'url("/images/Zigzag image.svg")',
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                width: "16rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
              }}
            >
              <QuestionnaireLinkExpiredIcon />
            </div>

            <div
              style={{
                maxWidth: "60%",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <h3>{t("common.estimateLinkExpiredTitle")}</h3>
              <p style={{ fontSize: "13px" }}>
                {t("common.estimateLinkExpiredMessage")}
              </p>
            </div>
          </Card>
        </div>
        {/*
        <div>
          <Footer />
        </div> */}
      </div>
    </div>
  );
};

export default EstimateLinkExpired;
