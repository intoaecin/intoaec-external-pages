import React, { useEffect, useState } from "react";
import { ModesOfContactType } from "@/types";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { LeadCaptureStore } from "@/lib/leadCapture/leadCaptureStore";
import { Card, CircularProgress, useMediaQuery, useTheme } from "@mui/material";
import { setCreateLeadFormData } from "@/features/leadCapture/setCreateFormData";
import PhoneIcon from "@mui/icons-material/Phone";
import MailIcon from "@mui/icons-material/Mail";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import VideocamIcon from "@mui/icons-material/Videocam";
import { useTranslation } from "react-i18next";

const RenderPreferredMode = ({ disabled = false }: { disabled?: boolean }) => {
  const { VITE_LEADMANAGER_ENDPOINT } = useEnv();
  const { t } = useTranslation();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const { post: leadCaptureFetch } = useAxios(
    VITE_LEADMANAGER_ENDPOINT + "/lead-capture"
  );
  const selectedMode = LeadCaptureStore.useState(
    (s) => s.leadCaptureData?.preferedContactType
  );

  const handleSetContactMode = (selectedMode: string) => {
    setCreateLeadFormData({
      preferedContactType: selectedMode,
    });
  };
  const [modesOfContact, setModesOfContact] = useState<
    Array<ModesOfContactType>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const fallbackModes: Array<ModesOfContactType> = [
    { preferedContactTypeId: "fallback-phone", preferedContactTypeValue: "PHONE" },
    { preferedContactTypeId: "fallback-email", preferedContactTypeValue: "EMAIL" },
    { preferedContactTypeId: "fallback-whatsapp", preferedContactTypeValue: "WHATSAPP" },
    { preferedContactTypeId: "fallback-video", preferedContactTypeValue: "VIDEO_CALL" },
  ];

  const fetchModesOfContact = async () => {
    setIsLoading(true);
    const data = await leadCaptureFetch({
      eventType: "GET_MODES_OF_CONTACT",
    });
    if (data?.body?.length) {
      setModesOfContact(data?.body);
    } else {
      setModesOfContact(fallbackModes);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (disabled) {
      setModesOfContact(fallbackModes);
      setIsLoading(false);
      return;
    }
    let isMounted = true;
    (async () => {
      try {
        await fetchModesOfContact();
      } catch {
        if (isMounted) {
          setModesOfContact(fallbackModes);
          setIsLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [disabled]);
  return (
    <div
      className={`  ${
        isSmallScreen ? "d-flex align-items-center ml-3 column  " : "d-flex align-items-center ml-3"
      } `}
    >
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center w-100">
          <CircularProgress size={28} />
        </div>
      ) : (
        modesOfContact
          ?.map((value) => {
            switch (value.preferedContactTypeValue) {
              case "PHONE":
                return {
                  title: t("contactOptions.phonecall"),
                  icon: <PhoneIcon sx={{ fontSize: "30px" }} />,
                  boxShadow: `${theme.palette.primary.dark}`,
                  value: value.preferedContactTypeValue,
                };
              case "EMAIL":
                return {
                  title: t("contactOptions.email"),
                  icon: <MailIcon sx={{ fontSize: "28px" }} />,
                  boxShadow: "#779FF8",
                  value: value.preferedContactTypeValue,
                };
              case "WHATSAPP":
                return {
                  title: t("contactOptions.inpersonmeeting"),
                  icon: <WhatsAppIcon sx={{ fontSize: "30px" }} />,
                  boxShadow: "#EB5574",
                  value: value.preferedContactTypeValue,
                };
              case "VIDEO_CALL":
                return {
                  title: t("contactOptions.videocall"),
                  icon: <VideocamIcon sx={{ fontSize: "30px" }} />,
                  boxShadow: "#FEC008",
                  value: value.preferedContactTypeValue,
                };
              default:
                return {
                  title: t("contactOptions.videocall"),
                  icon: <VideocamIcon sx={{ fontSize: "30px" }} />,
                  boxShadow: "#FEC008",
                  value: value.preferedContactTypeValue,
                };
            }
          })
          .map((card, index) => (
            <Card
              key={index}
              className="d-flex column justify-content-center align-items-center mx-1"
              style={{
                width: isSmallScreen ? "100px " : "20%",
                height: isSmallScreen ? "50px " : "50%",
                minWidth: "170px",
                minHeight: "100px",
                padding: "10px",
                margin: isSmallScreen ? "3px " : "",
                boxShadow:
                  selectedMode && selectedMode === card.value
                    ? `0px 0px 10px 2px ${card.boxShadow}`
                    : `0px 0px 10px 2px rgba(0, 0, 0, 0.1)`,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.6 : 1,
              }}
              onClick={() => {
                if (disabled) return;
                handleSetContactMode(card.value);
              }}
            >
              <div>{card.icon}</div>
              <div style={{ fontSize: "10px" }}>{card.title}</div>
            </Card>
          ))
      )}
    </div>
  );
};

export default RenderPreferredMode;
