import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import { translationLanguages } from "@/features/constants/languages";
import { useRouter } from "next/router";
import SpainFlagIcon from "@/assets/icons/spain-country-flag-icon";
import UkFlagIcon from "@/assets/icons/uk-flag";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Initialize language from localStorage on component mount
  useEffect(() => {
    const initializeLanguage = async () => {
      const savedLanguage = localStorage.getItem("preferredLanguage");
      if (savedLanguage) {
        try {
          router.locale = savedLanguage;
          await i18n.changeLanguage(savedLanguage);
        } catch (error) {
          console.error("Failed to initialize language:", error);
        }
      }
    };
    initializeLanguage();
  }, []); // Empty dependency array means this runs once on mount

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = async (lng: string) => {
    try {
      router.locale = lng;
      await i18n.changeLanguage(lng);
      localStorage.setItem("preferredLanguage", lng);
      handleClose();
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };
  const { t } = useTranslation();

  return (
    <>
      <Tooltip title={t("tooltips.changeLanguage")}>
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{
            ml: 1,
            color: "#34AFF9",
            "&:hover": {
              backgroundColor: "rgba(52, 175, 249, 0.04)",
            },
          }}
        >
          <LanguageIcon  width={30} height={2300}/>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        disableScrollLock
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {translationLanguages.map((language) => (
          <MenuItem
            key={language.CODE}
            onClick={() => handleLanguageChange(language.CODE)}
            // selected={i18n.language === language.CODE}
          >
            {language.CODE === "en" ? (
              <UkFlagIcon width={20} height={20} />
            ) : (
              <SpainFlagIcon width={20} height={20} />
            )}{" "}
            &nbsp; &nbsp;
            <span
              style={{
                ...(i18n.language == language.CODE && { color: "#3CA2FF" }),
              }}
            >
              {language.NAME}
            </span>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;
