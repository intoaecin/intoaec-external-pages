import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ReplayIcon from "@mui/icons-material/Replay";
import { Button } from "@mui/material";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import { UIDropDown } from "../HelperComponents/UIDropDown";
import { LeadUndoArchive } from "../PopupContents/LeadUndoArchive";
import { useDialog } from "../providers/DialogProvider";
import { useEnv } from "@/features/hooks/useEnv";
import { useTranslation } from "react-i18next";

const buttonStyle: React.CSSProperties = {
  borderRadius: "4px 0px 0px 4px",
  border: "none",
};
const dropdownStyle = {
  "& .MuiPaper-root": {
    width: "130px !important",
  },
  "& .MuiTypography-root": {
    fontSize: "13px",
  },
};

interface CustomEstimateMoreActionBtnProps {
  fetchData: (query: any) => Promise<any>;
  selectedClients: Array<string>;
  isConvertedToClient?: boolean;
}

const CustomEstimateMoreActionArchive: React.FC<
  CustomEstimateMoreActionBtnProps
> = ({ fetchData, selectedClients, isConvertedToClient }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { NEXT_PUBLIC_USERHUB_ENDPOINT, NEXT_PUBLIC_LEADMANAGER_ENDPOINT } =
    useEnv();
  const { post } = useAxiosWithAuth(
    NEXT_PUBLIC_LEADMANAGER_ENDPOINT + "/update"
  );
  const { popup } = useDialog();
  const reason = useRef<any>();
  const router = useRouter();

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setIsMenuOpen(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setIsMenuOpen(false);
  };
  const data = [
    {
      text: t("leadManager.Undo"),
      icon: <ReplayIcon style={{ width: "15px", height: "15px" }} />,
    },
  ];

  const unArchivelead = async (selectedClients: string[], reason?: any) => {
    const requestData = {
      eventType: "UPDATE_MULTIPLE_PROJECTS",
      projectIds: selectedClients,
      isProjectCompleted: false,
      isActive: true,
    };

    const data = await post({
      ...requestData,
      reason,
    }).finally(() => {
      fetchData(router.query);
    });

    if (data) {
      if (data.error) {
        toast.error(data.error?.message ?? data?.error);
        return;
      }
      if (data.code == "LEAD_UPDATED") {
        if (isConvertedToClient) {
          toast.success(t("toast.clientMovedToActiveSuccessfully"));
        } else {
          toast.success(t("toast.leadMovedToActiveSuccessfully"));
        }

        return;
      } else {
        toast.error(data.message);
      }
    }
  };

  return (
    <div>
      <Button
        endIcon={isMenuOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
        onClick={handleMenuClick}
        sx={{
          color: "primary.main",
          minWidth: "150px !important",
          padding: " 10px",
        }}
        style={buttonStyle} // Apply the buttonStyle inline
      >
        <span style={{ textTransform: "capitalize" }}>
          {t("common.moreAction")}
        </span>
      </Button>
      <UIDropDown
        data={data}
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleClose}
        dropdownStyle={dropdownStyle}
        onClick={() => {
          popup({
            content: (
              <LeadUndoArchive
                count={selectedClients.length}
                onReasonChange={(value) => {
                  reason.current = value;
                }}
                isClient={true}
                isProjectCompleted={true}
              />
            ),
            onYes: async () => {
              unArchivelead(selectedClients, reason.current).finally(() => {
                reason.current = null;
              });
            },
          });
        }}
      />
      {/* <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleClose}
        disableScrollLock={true}
        sx={dropdownStyle}
      >
    
        <MenuItem onClick={() => rowSelectedStage("ReActivate", selectedClients)}>
        <ListItemIcon>
            <ReplayIcon style={{ width: "15px", height: "15px" }} />
          </ListItemIcon>
          <ListItemText>{"Undo"}</ListItemText>
        </MenuItem>
      
      </Menu> */}
    </div>
  );
};

export default CustomEstimateMoreActionArchive;
