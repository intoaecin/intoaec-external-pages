import { toCamelNoSpace } from "@/utils/string";

const selectFeature = ["ALL", "ASSIGNED"];

export const userHubFeaturePermissionsDetails = {
  projects: {
    projects: selectFeature,
  },
  tasks: {
    tasks: selectFeature,
  },
  timeTracking: {
    time_Tracking: ["APPROVER", "CREATOR"],
  },
  defaultDashboard: {
    default_Dashboard: ["LEAD", "REVENUE", "PROJECT"],
  },
  billsAndExpenses: {
    billsAndExpenses: ["ALL", "READ", "WRITE"],
  },
  inventory: {
    inventory: ["APPROVER", "REQUESTER"],
  },
  po: {
    po: ["APPROVER", "CREATOR"],
  },
  wo: {
    wo: ["APPROVER", "CREATOR"],
  },
  indent: {
    indent: ["APPROVER", "CREATOR"],
  },
  estimates: {
    estimates: ["APPROVER", "CREATOR"],
  },
  proposals: {
    proposals: ["APPROVER", "CREATOR"],
  },
  budgeting: {
    budgeting: ["APPROVER", "CREATOR", "MANAGER"],
  },
  userhub: {
    userhub: ["ADMIN", "EDITOR", "VIEWER"],
  },
  templateCenter: {
    templateCenter: ["VIEW", "EDIT"],
  },
} as const;

export const getUserHubPermissionTooltip = (
  formLabel: string,
  option: string,
  t: (key: string) => string,
): string => {
  const tooltipKey = `featurePermissions.tooltip.${formLabel}.${toCamelNoSpace(option)}`;
  const tooltipText = t(tooltipKey);
  if (tooltipText && tooltipText !== tooltipKey) {
    return tooltipText;
  }

  const defaultTooltips: Record<string, Record<string, string>> = {
    projects: {
      all: "Access to view and manage all projects in the system",
      assigned: "Access only to projects assigned to this user",
    },
    tasks: {
      all: "Access to view and manage all tasks in the system",
      assigned: "Access only to tasks assigned to this user",
    },
    timeTracking: {
      approver: "Permission to approve time tracking",
      creator: "Permission to create time tracking",
    },
    defaultDashboard: {
      lead: "Set Lead Dashboard as the default dashboard view",
      revenue: "Set Revenue Dashboard as the default dashboard view",
      project: "Set Project Dashboard as the default dashboard view",
    },
    billsAndExpenses: {
      all: "Full access to view, create, and modify bills and expenses",
      read: "Read-only access to view bills and expenses",
      write: "Permission to create and modify bills and expenses",
    },
    inventory: {
      approver: "Permission to approve inventory requests",
      requester: "Permission to create inventory requests",
    },
    po: {
      approver: "Permission to approve purchase orders",
      creator: "Permission to create purchase orders",
    },
    wo: {
      approver: "Permission to approve work orders",
      creator: "Permission to create work orders",
    },
    indent: {
      approver: "Permission to approve indent",
      creator: "Permission to create indent",
    },
    estimates: {
      approver: "Permission to approve estimates",
      creator: "Permission to create estimates",
    },
    proposals: {
      approver: "Permission to approve proposals",
      creator: "Permission to create proposals",
    },
    budgeting: {
      approver: "Permission to approve budgeting",
      creator: "Permission to create budgeting",
      manager: "Permission to manage budgeting",
    },
    userhub: {
      admin: "Permission to manage userhub",
      editor: "Permission to edit userhub",
      viewer: "Permission to view userhub",
    },
    templateCenter: {
      view: "Permission to view Template Center templates",
      edit: "Permission to create and modify Template Center templates",
    },
  };

  return (
    defaultTooltips[formLabel]?.[toCamelNoSpace(option).toLowerCase()] ?? ""
  );
};
