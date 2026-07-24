import ActiveIcon from "@/assets/icons/active-user";
import ActivityTrackerIcon from "@/assets/icons/activityTracker-icon";
import ArchiveIcon from "@/assets/icons/archive-icon";
import AutomationIcon from "@/assets/icons/automation-icon";
import BellIcon from "@/assets/icons/bell-icon";
import InviteVendorMenuIcon from "@/assets/icons/inviteVendorMenuIcon";
import { BoqMenuIcon } from "@/assets/icons/boq-menu-icon";
import { BoqTemplatesMenuIcon } from "@/assets/icons/boq-templates-menu-icon";
import ClientsIcon from "@/assets/icons/clients-icon";
import DashboardIcon from "@/assets/icons/dashboard-icon";
import FilterIcon from "@/assets/icons/filter-icon";
import { IntegrationIcon } from "@/assets/icons/integration-icon";
import LeadCaptureIcon from "@/assets/icons/leadCapture-icon";
import LeadsIcon from "@/assets/icons/leads-icon";
import LocalizationIcon from "@/assets/icons/localization-icon";
import LocalizationMenuTaxIcon from "@/assets/icons/localizationMenuTax-icon";
import LocalizationMenuTimeIcon from "@/assets/icons/localizationMenuTime-icon";
import LostIcon from "@/assets/icons/lost-icon";
import NoteIcon from "@/assets/icons/note-icon";
import PreferenceAdminIcon from "@/assets/icons/preferenceAdmin-icon";
import PreferenceLeadIcon from "@/assets/icons/preferenceLead-icon";
import PreferenceMenuIcon from "@/assets/icons/preferenceMenu-icon";
import ProjectCompletedIcon from "@/assets/icons/project-compelted-icon";
import ProposalIcon from "@/assets/icons/proposal-icon";
import QuestionnaireIcon from "@/assets/icons/questionnaireMenu";
import SnoozeIcon from "@/assets/icons/snooze-icon";
import TaxesIcon from "@/assets/icons/taxes-icons";
import TemplateCenterIcon from "@/assets/icons/templateCenter-icon";
import UserAdd from "@/assets/icons/user-add";
import UserHubIcon from "@/assets/icons/userHub-icon";
import WonIcon from "@/assets/icons/won-icon";
import { v4 } from "uuid";
import RevenueDashboardIcon from "@/assets/icons/revenue-dashboard";
import LeadDashboardIcon from "@/assets/icons/lead-dashboard";
import ManageServicesIcon from "@/assets/icons/manage-services-icon";
import ReportMenuIcon from "@/assets/icons/reports-icon";
import {
  LayoutDashboard,
  FileChartColumn,
  TrendingUp,
  FileText,
  Users,
  UserPlus,
  Workflow,
  Building2,
  LayoutTemplate,
  ClipboardList,
  FileCheck,
  Bell,
  ListTodo,
  Calendar,
  FileSpreadsheet,
  Calculator,
  Boxes,
  Warehouse,
  Wrench,
  Package,
  HardHat,
  CalendarClock,
  MessageSquare,
  ChartColumn,
  Activity,
} from "lucide-react";
import GanttIcon from "@/assets/icons/gantt-icon";
import ResourcessIcon from "@/assets/icons/resources-icon";
import CRMIcon from "@/assets/icons/crm-icon";
import ProjectDashboardIcon from "@/assets/icons/projectDashboard-icon";
import AssetManagementIcon from "@/assets/icons/asset-management-icon";
import WorkerManagementIcon from "@/assets/icons/worker-management-icon";
import AddDiscountIcon from "@/assets/icons/addDiscount-icon";
import DeliveryManagement from "@/assets/icons/delivery-management";
import { TimeTrackingMenuIcon } from "@/assets/icons/timetracking-menu-icon";

export const emailVerifyTimeduration = 10;

// Full-screen route configuration
// Entries here hide both the top AppBar + sidebar drawer AND the ClientProfile header row
export const FULL_SCREEN_PATHNAME_ROUTES = [
  "/template-center/proposal/create",
  "/template-center/proposal/edit",
  "/client/profile/proposal/edit",
  "/client/profile/take-off/create",
  "/client/profile/take-off/edit",
];

// Add query tab values (lowercase) here to enable full-screen mode for that tab
export const FULL_SCREEN_QUERY_TABS = ["take-off", "schedule"];

export const tabs = [
  {
    label: "Active",
    Icon: (
      <ActiveIcon
        style={{
          width: "20px",
          height: "20px",
          transform: "scale(1.5)",
          fill: "#0085ff",
        }}
      />
    ),
    query: {
      isActive: "true",
      isSnoozed: "false",
    },
    color: "#0085ff",
  },
  {
    label: "Snoozed",
    Icon: (
      <SnoozeIcon style={{ width: "20px", height: "20px", fill: "#FF9F00" }} />
    ),
    query: {
      isSnoozed: "true",
    },
    color: "#FF9F00",
  },
  {
    label: "Archive",
    Icon: (
      <ArchiveIcon
        style={{
          width: "20px",
          height: "20px",
          fill: "#FF9447",
        }}
      />
    ),
    query: {
      isActive: "false",
      isSnoozed: "false",
    },
    color: "#FF9447",
  },
  {
    label: "Won",
    Icon: (
      <WonIcon
        style={{
          width: "30px",
          height: "30px",
          fill: "#009f4c",
        }}
      />
    ),
    query: { projectStatus: JSON.stringify(["WON"]) },
    color: "#009f4c",
  },

  {
    label: "Lost",
    Icon: (
      <LostIcon
        style={{
          width: "30px",
          height: "30px",
          fill: "#ff614f",
        }}
      />
    ),
    query: { projectStatus: JSON.stringify(["LOST"]) },
    color: "#ff614f",
  },
];

export const clientTabs = [
  {
    label: "Active",
    Icon: (
      <ActiveIcon
        style={{
          width: "20px",
          height: "20px",
          transform: "scale(1.5)",
          fill: "#0085ff",
        }}
      />
    ),
    query: {
      isActive: "true",
      // projectStatus: JSON.stringify([
      //   "NEW",
      //   "CONNECTED",
      //   "SCHEDULED_MEETING",
      //   "PROPOSAL_SENT",
      // ]),
    },
    color: "#0085ff",
  },
  {
    label: "Archive",
    Icon: (
      <ArchiveIcon
        style={{
          width: "20px",
          height: "20px",
          fill: "#FF9447",
        }}
      />
    ),
    query: {
      isActive: "false",
      // projectStatus: JSON.stringify([
      //   "NEW",
      //   "CONNECTED",
      //   "SCHEDULED_MEETING",
      //   "PROPOSAL_SENT",
      // ]),
    },
    color: "#FF9447",
  },
  {
    label: "Completed",
    Icon: (
      <ProjectCompletedIcon
        style={{
          width: "20px",
          height: "20px",
          fill: "#2ED47A",
        }}
      />
    ),
    query: { isProjectCompleted: "true" },
    color: "#2ED47A",
  },
];

export const menuList = [
  {
    text: `Dashboard`,
    icon: <LayoutDashboard style={{ width: "18px", height: "18px" }} />,
    path: "/dashboard",
    subValues: [
      {
        text: `Lead Dashboard`,
        icon: (color: string) => (
          <div className="d-flex justify-content-center align-items-center">
            <svg
              className="mr-1"
              width="8"
              height="8"
              viewBox="0 0 7 7"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="3.29846" cy="3.61426" r="3.08984" />
            </svg>
            <FileChartColumn
              style={{ width: "18px", height: "18px", color }}
            />
          </div>
        ),
        to: `/dashboard`,
        path: `/dashboard`,
      },
      {
        text: `Revenue Dashboard`,
        icon: (color: string) => (
          <div className="d-flex justify-content-center align-items-center">
            <svg
              className="mr-1"
              width="8"
              height="8"
              viewBox="0 0 7 7"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="3.29846" cy="3.61426" r="3.08984" />
            </svg>{" "}
            <TrendingUp
              style={{ width: "18px", height: "18px", color }}
            />
          </div>
        ),
        to: `/dashboard/revenue`,
        path: `/dashboard/revenue`,
      },
      {
        text: `Project Management`,
        icon: (color: string) => (
          <div className="d-flex justify-content-center align-items-center">
            <svg
              className="mr-1"
              width="8"
              height="8"
              viewBox="0 0 7 7"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="3.29846" cy="3.61426" r="3.08984" />
            </svg>{" "}
            <FileText
              style={{ width: "18px", height: "18px", color }}
            />
          </div>
        ),
        to: `/dashboard/project-management`,
        path: `/dashboard/project-management`,
      },
    ],
  },
  {
    text: `CRM`,
    icon: <Users style={{ width: "20px", height: "20px" }} />,
    // to: "/crm",
    path: "/leadmanager",
    subValues: [
      {
        text: `Lead Manager`,
        icon: (color: string) => (
          <div className="d-flex justify-content-center align-items-center">
            <svg
              className="mr-1"
              width="8"
              height="8"
              viewBox="0 0 7 7"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="3.29846" cy="3.61426" r="3.08984" />
            </svg>
            <UserPlus style={{ width: "18px", height: "18px", color }} />
          </div>
        ),
        to: "/leadmanager/master",
        query: tabs[0].query,
        path: "/leadmanager/master",
      },
      {
        text: `Automation`,
        icon: (color: string) => (
          <div className="d-flex justify-content-center align-items-center">
            <svg
              className="mr-1"
              width="8"
              height="8"
              viewBox="0 0 7 7"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="3.29846" cy="3.61426" r="3.08984" />
            </svg>
            <Workflow
              style={{ width: "18px", height: "18px", color }}
            />
          </div>
        ),
        to: `/automation`,
        path: "/automation",
      },
    ],
  },
  // {
  //   text: `Lead Manager`,
  //   icon: <LeadsIcon style={{ width: "20px", height: "20px" }} />,
  //   to: "/leadmanager/master",
  //   query: tabs[0].query,
  //   path: "/leadmanager",
  // },
  {
    text: `Clients/Projects`,
    icon: <Building2 style={{ width: "20px", height: "20px" }} />,
    to: "/client",
    query: clientTabs[0].query,
    path: "/client",
  },
  {
    text: "Template Center",
    icon: (
      <LayoutTemplate
        style={{
          width: "18px",
          height: "18px",
        }}
      />
    ),
    path: "/template-center",
    subValues: [
      {
        text: `Questionnaire`,
        icon: (color: string) => (
          <div className="d-flex justify-content-center align-items-center">
            <svg
              className="mr-1"
              width="8"
              height="8"
              viewBox="0 0 7 7"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="3.29846" cy="3.61426" r="3.08984" />
            </svg>
            <ClipboardList
              style={{ width: "18px", height: "18px", color }}
            />
          </div>
        ),
        to: `/template-center/questionnaire`,
        path: "/template-center/questionnaire",
      },
      {
        text: `Proposal`,
        icon: (color: string) => (
          <div className="d-flex justify-content-center align-items-center">
            <svg
              className="mr-1"
              width="8"
              height="8"
              viewBox="0 0 7 7"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="3.29846" cy="3.61426" r="3.08984" />
            </svg>
            <FileText
              style={{ width: "18px", height: "18px", color }}
            />
          </div>
        ),
        to: `/template-center/proposal`,
        path: "/template-center/proposal",
      },
      {
        text: `Terms and Condition`,
        icon: (color: string) => (
          <div className="d-flex justify-content-center align-items-center">
            <svg
              className="mr-1"
              width="8"
              height="8"
              viewBox="0 0 7 7"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="3.29846" cy="3.61426" r="3.08984" />
            </svg>
            <FileCheck style={{ width: "18px", height: "18px", color }} />
          </div>
        ),
        to: `/template-center/terms-and-condition`,
        path: "/template-center/terms-and-condition",
      },
      {
        text: `Notification`,
        icon: (color: string) => (
          <div className="d-flex justify-content-center align-items-center">
            <svg
              className="mr-1"
              width="8"
              height="8"
              viewBox="0 0 7 7"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="3.29846" cy="3.61426" r="3.08984" />
            </svg>
            <Bell
              style={{ width: "18px", height: "18px", color }}
            />
          </div>
        ),
        to: `/template-center/notification-template`,
        path: "/template-center/notification-template",
      },
      {
        text: `Tasks`,
        icon: (color: string) => (
          <div className="d-flex justify-content-center align-items-center">
            <svg
              className="mr-1"
              width="8"
              height="8"
              viewBox="0 0 7 7"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="3.29846" cy="3.61426" r="3.08984" />
            </svg>
            <ListTodo
              style={{ width: "18px", height: "18px", color }}
            />
          </div>
        ),
        to: `/template-center/tasks`,
        path: "/template-center/tasks",
      },
      {
        text: `Project Schedule`,
        icon: (color: string) => (
          <div className="d-flex justify-content-center align-items-center">
            <svg
              className="mr-1"
              width="8"
              height="8"
              viewBox="0 0 7 7"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="3.29846" cy="3.61426" r="3.08984" />
            </svg>
            <Calendar style={{ width: "16px", height: "16px", color }} />
          </div>
        ),
        to: `/template-center/schedule`,
        path: "/template-center/schedule",
      },
      {
        text: `BOQ`,
        icon: (color: string) => (
          <div className="d-flex justify-content-center align-items-center">
            <svg
              className="mr-1"
              width="8"
              height="8"
              viewBox="0 0 7 7"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="3.29846" cy="3.61426" r="3.08984" />
            </svg>
            <FileSpreadsheet
              style={{ width: "18px", height: "18px", color }}
            />
          </div>
        ),
        to: `/boq/library`,
        path: "/boq/library",
      },
      {
        text: `Estimate`,
        icon: (color: string) => (
          <div className="d-flex justify-content-center align-items-center">
            <svg
              className="mr-1"
              width="8"
              height="8"
              viewBox="0 0 7 7"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="3.29846" cy="3.61426" r="3.08984" />
            </svg>
            <Calculator
              style={{ width: "15px", height: "15px", color }}
            />
          </div>
        ),
        to: `/boq/template`,
        path: "/boq/template",
      },
    ],
  },
  {
    text: "Resources",
    icon: (
      <Boxes
        style={{
          width: "18px",
          height: "18px",
        }}
      />
    ),
    // Children use mixed prefixes (/my-vendor, /asset-management, /worker-management).
    // Active highlight is resolved from subValues in SideBarListDrawerList.
    path: "",
    to: "",
    subValues: [
      {
        text: `Manage Warehouse`,
        icon: (color: string) => (
          <div className="d-flex justify-content-center align-items-center">
            <svg
              className="mr-1"
              width="8"
              height="8"
              viewBox="0 0 7 7"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="3.29846" cy="3.61426" r="3.08984" />
            </svg>
            <Warehouse
              style={{ width: "18px", height: "18px", color }}
            />
          </div>
        ),
        to: `/my-vendor/manage-products`,
        path: "/my-vendor/manage-products",
      },
      {
        text: `Manage services`,
        icon: (color: string) => (
          <div className="d-flex justify-content-center align-items-center">
            <svg
              className="mr-1"
              width="8"
              height="8"
              viewBox="0 0 7 7"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="3.29846" cy="3.61426" r="3.08984" />
            </svg>
            <Wrench
              style={{ width: "18px", height: "18px", color }}
            />
          </div>
        ),
        to: `/my-vendor/manage-services`,
        path: "/my-vendor/manage-services",
      },
      {
        text: `Manage Assets`,
        icon: (color: string) => (
          <div className="d-flex justify-content-center align-items-center">
            <svg
              className="mr-1"
              width="8"
              height="8"
              viewBox="0 0 7 7"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="3.29846" cy="3.61426" r="3.08984" />
            </svg>
            <Package
              style={{ width: "18px", height: "18px", color }}
            />
          </div>
        ),
        to: `/asset-management`,
        path: "/asset-management",
      },
      {
        text: `Manage Workers`,
        icon: (color: string) => (
          <div className="d-flex justify-content-center align-items-center">
            <svg
              className="mr-1"
              width="8"
              height="8"
              viewBox="0 0 7 7"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="3.29846" cy="3.61426" r="3.08984" />
            </svg>
            <HardHat
              style={{ width: "20px", height: "20px", color }}
            />
          </div>
        ),
        to: `/worker-management`,
        path: "/worker-management",
      },
    ],
  },
  {
    text: `Time Sheet`,
    icon: <CalendarClock style={{ width: "18px", height: "18px" }} />,
    to: `/time-tracking`,
    path: "/time-tracking",
  },
  {
    text: "Chat",
    icon: <MessageSquare style={{ width: "18px", height: "18px" }} />,
    to: "/chat",
    path: "/chat",
  },
  {
    text: `Reports`,
    icon: <ChartColumn style={{ width: "18px", height: "18px" }} />,
    to: `/reports`,
    path: "/reports",
  },
  {
    text: `Activity Tracker`,
    icon: <Activity style={{ width: "18px", height: "18px" }} />,
    to: `/activityTracker`,
    path: "/activityTracker",
  },
];

export const settingsTab = [
  {
    label: "Account",
    Icon: <UserAdd style={{ width: "20px", height: "20px" }} />,
    query: {
      tab: "ACCOUNT",
    },
  },
  {
    label: "Notification Template",
    Icon: <BellIcon style={{ width: "20px", height: "20px" }} />,
    query: {
      tab: "NOTIFICATION_TEMPLATE",
    },
  },
  {
    label: "Proposal Template",
    Icon: <ProposalIcon style={{ width: "30px", height: "30px" }} />,
    query: {
      tab: "PROPOSAL_TEMPLATE",
    },
  },
  {
    label: "Questionnaire",
    Icon: <QuestionnaireIcon style={{ width: "20px", height: "20px" }} />,
    query: {
      tab: "QUESTIONNAIRE&trash=FALSE",
    },
  },
  {
    label: "Terms & Condition Template",
    Icon: <NoteIcon style={{ width: "20px", height: "20px" }} />,
    query: {
      tab: "TERMS_CONDITIONS",
    },
  },
  {
    label: "Preferences",
    Icon: (
      <FilterIcon
        style={{
          width: "20px",
          height: "20px",
          transform: "rotate(90deg)",
        }}
      />
    ),
    query: {
      tab: "PREFERENCES",
    },
  },
  {
    label: "Taxes",
    Icon: (
      <TaxesIcon
        style={{
          width: "20px",
          height: "20px",
        }}
      />
    ),
    query: {
      tab: "TAXES",
    },
  },
];

export const fileHeaderDataForLead = [
  "S.No",
  "Lead name",
  "Stage",
  "Project type",
  "Lead source",
  "Reporter",
  "Lead created",
  "Project location/ Area",
];

export const fileHeaderDataForActivity = [
  "S.No",
  "User (Role)",
  "Activity",
  "IP Address",
  "Geo Location",
  "Time Stamp",
  "Reason",
  "Change History",
];

export const defaultBOQColumns = [
  {
    columnLabel: "Description",
    accessor: "itemDescription",
    columnValue: "itemDescription",
    fixedOrder: true,
    showToCustomer: true,
    disabled: true,
    columnId: v4(),
  },
  {
    columnLabel: "Qty",
    accessor: "quantity",
    columnValue: "quantity",
    showToCustomer: true,
    fixedOrder: false,
    disabled: true,
    columnId: v4(),
    dataType: "Number",
  },
  {
    columnLabel: "Unit",
    accessor: "unit",
    columnValue: "unit",
    fixedOrder: false,
    showToCustomer: true,
    disabled: true,
    columnId: v4(),
  },
  {
    columnLabel: "Rate/Unit (Incl. Tax)",
    accessor: "ratePerUnit",
    columnValue: "ratePerUnit",
    fixedOrder: false,
    showToCustomer: true,
    disabled: true,
    columnId: v4(),
    dataType: "Number",
  },
  {
    columnLabel: "Profit (%)",
    accessor: "profitMarkup",
    columnValue: "profitMarkup",
    showToCustomer: false,
    fixedOrder: false,
    disabled: true,
    columnId: v4(),
    dataType: "Number",
  },
  {
    columnLabel: "Rate Incl. Profit",
    accessor: "rateIncluProfit",
    columnValue: "rateIncluProfit",
    showToCustomer: false,
    fixedOrder: false,
    disabled: true,
    columnId: v4(),
  },
  {
    columnLabel: "Start Date",
    accessor: "startDate",
    columnValue: "startDate",
    showToCustomer: true,
    fixedOrder: false,
    disabled: false,
    columnId: v4(),
    dataType: "Date",
  },
  {
    columnLabel: "Duration",
    accessor: "duration",
    columnValue: "duration",
    showToCustomer: true,
    fixedOrder: false,
    disabled: false,
    columnId: v4(),
    dataType: "Number",
  },
  {
    columnLabel: "End Date",
    accessor: "endDate",
    columnValue: "endDate",
    showToCustomer: true,
    fixedOrder: false,
    disabled: false,
    columnId: v4(),
    dataType: "Date",
  },
  // {
  //   columnValue: "Labour",
  //   accessor: "labour",
  //   columnValue: "labour",
  //   isDraggable: true,
  //   disabled: true,
  // },
  {
    columnLabel: "Total Cost",
    accessor: "totalCost",
    columnValue: "totalCost",
    showToCustomer: true,
    fixedOrder: true,
    disabled: true,
    columnId: v4(),
    dataType: "Number",
  },
];

export const activeTab = (pathname: string, path: string): string => {
  return pathname == path ? "#34AFF9" : "#a7a8a9";
};
export const SettingDropDownData = [
  {
    text: "Preferences",
    icon: (color: string) => (
      <PreferenceMenuIcon
        style={{ width: "18px", height: "18px", color }}
        fill={color}
      />
    ),
    path: "/preferences",
    to: "/preferences",
  },
  {
    text: `Integration`,
    icon: (color: string) => (
      <IntegrationIcon
        style={{ width: "18px", height: "18px", color }}
        fill={color}
      />
    ),
    to: `/integrations`,
    path: "/integrations",
  },
  // {
  //   text: "Localization",
  //   icon: (color: string) => (
  //     <LocalizationIcon
  //       style={{ width: "18px", height: "18px", color }}
  //       fill={color}
  //     />
  //   ),
  //   path: "/localization/time-zone-and-currency",
  //   to: "/localization/time-zone-and-currency",
  // },
];

// const user data
export const UserDropDownData: any = [
  {
    text: `User Hub`,
    icon: (color: string) => (
      <UserHubIcon
        style={{ width: "18px", height: "18px", color }}
        fill={color}
      />
    ),
    to: `/userHub/team`,
    path: "/userHub/team",
  },
  {
    text: `Invite Vendor`,
    icon: (color: string) => {
      return (
        <InviteVendorMenuIcon
          style={{ width: "18px", height: "18px", color }}
          fill={color}
        />
      );
    },
    to: `/my-vendor/invite-vendor`,
    path: "/my-vendor/invite-vendor",
  },
];

export type Tab = "" | "user" | "setting";

export const sidebarItems = [
  {
    label: "overview",
    path: "/preferences",
    icon: (color: string) => (
      <PreferenceMenuIcon
        style={{ width: "18px", height: "18px", color }}
        fill={color}
      />
    ),
  },
  {
    label: "lead",
    path: "/preferences/lead",
    icon: (color: string) => (
      <PreferenceLeadIcon
        style={{ width: "18px", height: "18px", color }}
        fill={color}
      />
    ),
  },
  {
    label: "admin",
    path: "/preferences/admin",
    icon: (color: string) => (
      <PreferenceAdminIcon
        style={{ width: "18px", height: "18px", color }}
        fill={color}
      />
    ),
  },
  {
    label: "website",
    path: "/preferences/website",
    icon: (color: string) => (
      <PreferenceAdminIcon
        style={{ width: "18px", height: "18px", color }}
        fill={color}
      />
    ),
  },
  {
    label: "leadcapture",
    path: "/preferences/lead-capture",
    icon: (color: string) => (
      <LeadCaptureIcon
        style={{ width: "18px", height: "18px", color }}
        fill={color}
      />
    ),
  },
];

export const LocalizationSubItems = [
  {
    text: `Time zone and currency`,
    label: "timezoneandcurrency",
    icon: (color: string) => (
      <LocalizationMenuTimeIcon
        style={{ width: "18px", height: "18px", color }}
        fill={color}
      />
    ),
    to: `/localization/time-zone-and-currency`,
    path: "/localization/time-zone-and-currency",
  },
  {
    text: `Taxes`,
    label: "taxes",
    icon: (color: string) => (
      <LocalizationMenuTaxIcon
        style={{ width: "18px", height: "18px", color }}
        fill={color}
      />
    ),
    to: `/localization/taxes`,
    path: "/localization/taxes",
  },
  {
    text: `Discounts`,
    label: "discounts",
    icon: (color: string) => (
      <AddDiscountIcon
        style={{ width: "18px", height: "18px", color }}
        fill={color}
      />
    ),
    to: `/localization/discount`,
    path: "/localization/discount",
  },
];
