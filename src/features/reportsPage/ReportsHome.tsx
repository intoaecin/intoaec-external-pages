import ClientsMenuIcon from "@/assets/icons/client-menu-icon";
import EstimateMenuIcon from "@/assets/icons/ClientMenuIcons/EstimateMenuIcon";
import LockMenuIcon from "@/assets/icons/ClientMenuIcons/LockMenuIcon";
import ProposalMenuIcon from "@/assets/icons/ClientMenuIcons/ProposalMenuIcon";
import ScheduleMenuIcon from "@/assets/icons/ClientMenuIcons/ScheduleMenuIcon";
import TaskMenuIcon from "@/assets/icons/ClientMenuIcons/TaskMenuIcon";
import TimeTrackingMenuIcon from "@/assets/icons/ClientMenuIcons/TimeTrackingMenuIcon";
import EmailMenuIcon from "@/assets/icons/emails-menu-icon";
import ExpensesMenuIcon from "@/assets/icons/expenses-menu-icon";
import IncomeMenuIcon from "@/assets/icons/income-menu-icon";
import LeadsMenuIcon from "@/assets/icons/leads-menu-icon";
import PurchaseOrderMenuIcon from "@/assets/icons/purchase-order-icon";
import QuestionnaireMenuIcon from "@/assets/icons/questionnaire-menu-icon";
import RfqMenuIcon from "@/assets/icons/rfq-menu-icon";
import { Box, Grid, Tooltip, Typography } from "@mui/material";
import { useRouter } from "@/features/reportsPage/publicRuntime";
import React from "react";
import { useTranslation } from "react-i18next";

const menuCards = [
  {
    name: "Leads",
    displayName: "Lead",
    icon: <LeadsMenuIcon width={"25px"} />,
  },
  {
    name: "Clients",
    displayName: "Client",
    icon: <ClientsMenuIcon width={"25px"} />,
  },
  {
    name: "Proposal",
    displayName: "Proposal",
    icon: <ProposalMenuIcon width={"25px"} />,
  },
  {
    name: "Questionnaire",
    displayName: "Questionnaire",
    icon: <QuestionnaireMenuIcon width={"25px"} />,
  },
  {
    name: "Estimate",
    displayName: "Estimate",
    icon: <EstimateMenuIcon width={"25px"} />,
  },
  {
    name: "Income",
    displayName: "Income",
    icon: <IncomeMenuIcon width={"25px"} />,
  },
  {
    name: "Expenses",
    displayName: "Expense",
    icon: <ExpensesMenuIcon width={"25px"} />,
  },
  {
    name: "BillsExpenses",
    displayName: "BillsExpenses",
    icon: <ExpensesMenuIcon width={"25px"} />,
  },
  {
    name: "RFQ",
    displayName: "Rfq",
    icon: <RfqMenuIcon width={"25px"} />,
  },
  {
    name: "PurchaseOrder",
    displayName: "PurchaseOrder",
    icon: <PurchaseOrderMenuIcon width={"25px"} />,
  },
  {
    name: "Emails",
    displayName: "Email",
    icon: <EmailMenuIcon width={"25px"} />,
  },
  {
    name: "TimeTracking",
    displayName: "TimeTracking",
    icon: <TimeTrackingMenuIcon width={"25px"} />,
  },
  {
    name: "Tasks",
    displayName: "Task",
    icon: <TaskMenuIcon width={"25px"} />,
  },
  {
    name: "Schedule",
    displayName: "Schedule",
    icon: <ScheduleMenuIcon width={"25px"} />,
  },
];
const ReportsHome = () => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="mx-2">
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Grid container spacing={2}>
          {menuCards.map((card, index) => {
            // Define the disabled condition
            const isDisabled = [
              // "Schedule",
              // "Selections",
              "MoodBoard",
              "2DPlan",
            ].includes(card.name);

            return (
              <Grid
                item
                xs={12} // 1 card per row on mobile (xs breakpoint)
                sm={6} // 2 cards per row on tablets (sm breakpoint)
                md={3} // 4 cards per row on laptops (md breakpoint)
                key={index}
              >
                <Tooltip title={isDisabled ? t("common.comingSoon") : ""} arrow>
                  <div
                    onClick={() => {
                      if (!isDisabled) {
                        router.push(`/reports/${card.name}`);
                      }
                    }}
                    style={{
                      boxShadow:
                        "rgba(17, 17, 26, 0.05) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 0px 8px",
                      padding: 3,
                      margin: 1,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      position: "relative",
                      height: 100,
                      textAlign: "center",
                      backgroundColor: "#FFFFFF",
                      color: "#000000",
                      opacity: isDisabled ? 0.6 : 1,
                    }}
                  >
                    {card.icon} &nbsp;
                    <Typography>{t(`module.${card.displayName}`)}</Typography>
                    {isDisabled && (
                      <div
                        style={{
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                        }}
                      >
                        <LockMenuIcon width={"15px"} />
                      </div>
                    )}
                  </div>
                </Tooltip>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </div>
  );
};

export default ReportsHome;

