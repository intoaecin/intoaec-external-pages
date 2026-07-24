import React, { useRef, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import SnoozeIcon from "@/assets/icons/snooze-icon";
import ArchiveIcon from "@/assets/icons/archive-icon";
import DeleteIcon from "@/assets/icons/delete-icon";
import { Button } from "@mui/material";
import router, { useRouter } from "next/router";
import { UIDropDown } from "../HelperComponents/UIDropDown";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useDialog } from "../providers/DialogProvider";
import { toast } from "react-toastify";
import { LeadSnooze } from "../PopupContents/LeadSnooze";
import { LeadArchive } from "../PopupContents/LeadArchive";
import { useEnv } from "@/features/hooks/useEnv";
import ProjectCompletedIcon from "@/assets/icons/project-compelted-icon";
import { clientTabs } from "@/lib/constants";
import CompletedProjectCongratulationDialog from "../Estimates/ProjectCompeltedDialog";
import { useTranslation } from "react-i18next";

const buttonStyle: React.CSSProperties = {
  borderRadius: "4px 0px 0px 4px",
  border: "none",
};

interface CustomEstimateMoreActionBtnProps {
  fetchData: (query: any) => Promise<any>;
  fromClientList?: boolean;
  selectedClients: Array<string>;
  isConvertedToClient?: boolean;
}

const CustomEstimateMoreActionActive: React.FC<
  CustomEstimateMoreActionBtnProps
> = ({ fetchData, selectedClients,fromClientList, isConvertedToClient }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const [isMarkAsCompletedDialogOpen, setMarkAsCompletedDialogOpen] =
    useState(false);
  const { popup, closeModal, setPreventClose } = useDialog();
  const { NEXT_PUBLIC_USERHUB_ENDPOINT, NEXT_PUBLIC_LEADMANAGER_ENDPOINT } =
    useEnv();
  const { post } = useAxiosWithAuth(
    NEXT_PUBLIC_LEADMANAGER_ENDPOINT + "/update"
  );

  const { push, query } = useRouter();
  const snoozeDate = useRef<any>();
  const reason = useRef<any>();

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setIsMenuOpen(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setIsMenuOpen(false);
  };
  const handleMarkAsCompletedDialogClose = () => {
    setMarkAsCompletedDialogOpen(false);
  };
  const handleMarkAsCompletedDialogOpen: React.MouseEventHandler<
    HTMLButtonElement
  > = () => {
    setMarkAsCompletedDialogOpen(true);
  };
  const data = [
    {
      text: t("common.markAsCompleted"),
      type: "Mark as completed",
      icon: <ProjectCompletedIcon style={{ width: "15px", height: "15px" }} />,
    },
    {
      text: t("common.archive"),
      type: "Archive",
      icon: <ArchiveIcon style={{ width: "15px", height: "15px" }} />,
    },
  ];
  const dropdownStyle = {
    "& .MuiPaper-root": {
      width: i18n.language == "es" ? "235px !important" : "190px !important",
      left: !fromClientList ? "calc(100% - 360px) !important" : "",
    },
    "& .MuiTypography-root": {
      fontSize: "13px",
    },
  };
  const handleMarkAsCompleted = async (projectIds: string[]) => {
    const requestData = {
      eventType: "UPDATE_MULTIPLE_PROJECTS",
      isProjectCompleted: true,
      projectIds: projectIds,
    };

    const data = await post({
      ...requestData,
    });
    if (data) {
      if (data.error) {
        toast.error(data.error?.message ?? data?.error);
        return;
      }
      if (data.code === "LEAD_UPDATED") {
        toast.success(t("toast.congratulationProjectCompletedSuccessfully"));
        setMarkAsCompletedDialogOpen(true);
        setTimeout(() => {
          router.push({
            pathname: "client",
            query: clientTabs[2].query,
          });
          handleMarkAsCompletedDialogClose();
        }, 2000);
        return;
      } else {
        toast.error(data.message);
      }
    }
  };
  const archiveLeads = async (selectedClients: string[], reason?: any) => {
    const requestData = {
      eventType: "ARCHIVE_LEADS",
      archive: true,
      leads: selectedClients,
    };

    const data = await post({
      ...requestData,
      reason,
    }).finally(() => {
      fetchData(query);
    });
    if (data) {
      if (data.error) {
        toast.error(data.error?.message ?? data?.error);
        return;
      }
      if (data.code == "LEADS_ARCHIVED") {
          if (isConvertedToClient) {
            toast.success(t("toast.clientArchivedSuccessfully"));
          } else {
            toast.success(t("toast.leadArchivedSuccessfully"));
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
        onClick={(value: (typeof data)[0]) => {
          if (value.type == "Mark as completed") {
            handleMarkAsCompleted(selectedClients);
          } else {
            popup({
              content: (
                <LeadArchive
                  count={selectedClients.length}
                  onReasonChange={(value) => {
                    reason.current = value;
                  }}
                  isClient={true}
                />
              ),
              onYes: async () => {
                archiveLeads(selectedClients, reason.current).finally(() => {
                  reason.current = null;
                });
              },
            });
          }
        }}
      />
      {/* <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleClose}
        disableScrollLock={true}
        sx={dropdownStyle}
      >
        <MenuItem onClick={() => rowSelectedStage("Snooze", selectedClients)}>
          <ListItemIcon>
            <SnoozeIcon style={{ width: "15px", height: "15px" }} />
          </ListItemIcon>
          <ListItemText>{"Snooze"}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => rowSelectedStage("Archive", selectedClients)}>
          <ListItemIcon>
            <ArchiveIcon style={{ width: "15px", height: "15px" }} />
          </ListItemIcon>
          <ListItemText>{"Archive"}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleClose("")}>
          <ListItemIcon>
            <DeleteIcon style={{ width: "15px", height: "15px" }} />
          </ListItemIcon>
          <ListItemText color="error">{"Delete"}</ListItemText>
        </MenuItem>
      </Menu> */}
      {isMarkAsCompletedDialogOpen && (
        <>
          <CompletedProjectCongratulationDialog
            isMarkAsCompletedDialogOpen={isMarkAsCompletedDialogOpen}
            onClose={handleMarkAsCompletedDialogClose}
          />
          ;
        </>
      )}
    </div>
  );
};

export default CustomEstimateMoreActionActive;
