// CompletedProjectCongratulationDialog.jsx
import { useEnv } from "@/features/hooks/useEnv";
import EstimateScratchIcon from "@/assets/icons/estimate-scratch-icon";
import EstimateTemplateIcon from "@/assets/icons/estimate-template-icon";
import ProjectCompletedCongratulationIcon from "@/assets/icons/project-completed-congraglation-icon";
import ProposalScratchIcon from "@/assets/icons/proposalScratch";
import UploadProposalIcon from "@/assets/icons/uploadProposal";
import { clientTabs } from "@/lib/constants";
import { LoadingButton } from "@mui/lab";
import { Card, CardContent, Divider, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { v4 as uuid } from "uuid";
interface CompletedProjectCongratulationDialogProps {
  isMarkAsCompletedDialogOpen: boolean;
  onClose?: React.MouseEventHandler<HTMLButtonElement>;
}

const CompletedProjectCongratulationDialog: React.FC<
  CompletedProjectCongratulationDialogProps
> = ({ isMarkAsCompletedDialogOpen, onClose }) => {
  const { t } = useTranslation();
  return (
    <div>
      <Dialog
        open={isMarkAsCompletedDialogOpen}
        disableScrollLock
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogContent className="border-bottom">
          <div>
            <ProjectCompletedCongratulationIcon
              style={{ width: "150px", height: "200px" }}
            />
            <Typography component={"h3"} className="fw-600 text-center">
              {t("common.congratulation")}
            </Typography>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompletedProjectCongratulationDialog;
