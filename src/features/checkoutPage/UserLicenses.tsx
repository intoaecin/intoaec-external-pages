"use client";

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface UserLicensesProps {
  numberOfLicenses: number;
}

const UserLicenses: React.FC<UserLicensesProps> = ({ numberOfLicenses }) => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          {t("checkout.userLicenses")}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {t("checkout.purchasingLicenses", { count: numberOfLicenses })}
        </Typography>
        <Box>
          <Typography variant="body2" fontWeight="600" mb={1}>
            {t("checkout.licenseDetails")}:
          </Typography>
          <List dense disablePadding>
            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={t("checkout.crmModuleIncluded")}
                primaryTypographyProps={{ variant: "body2" }}
              />
            </ListItem>
            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={t("checkout.procurementModuleIncluded")}
                primaryTypographyProps={{ variant: "body2" }}
              />
            </ListItem>
            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={t("checkout.fullAccessToFeatures")}
                primaryTypographyProps={{ variant: "body2" }}
              />
            </ListItem>
            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={t("checkout.customerSupport247")}
                primaryTypographyProps={{ variant: "body2" }}
              />
            </ListItem>
          </List>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserLicenses;
