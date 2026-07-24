/** Local stubs — full BOQ/automation types live in intoaec-UI; not needed for public capture. */
type WorkflowNodePersistedPayload = Record<string, unknown>;
type Material = Record<string, unknown>;
type BoqMaterialPropsTypes = Record<string, unknown>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Column<T = any> = Record<string, any> & { id?: string; accessor?: keyof T | string };

export interface LeadStatusesTypes {
  leadStatusId: string;
  leadStatusValue: string;
  color?: string;
}
export interface ProjectType {
  projectTypeId: string;
  projectTypeValue: string;
  projectTypeImageUrl?: string;
  isDefault?: boolean;
  isActive?: boolean;
}
export interface ModesOfContactType {
  preferedContactTypeId: string;
  preferedContactTypeValue: string;
}

export interface ModuleTypes {
  permissionId: string;
  module: string;
  createdAt: string;
}
export interface UsersTypes {
  name: string;
  role: string;
  userId: string;
  profileImageUrl?: string;
  emailId?: string;
  mobileNumber?: string;
}

export interface UserAccountProfileType {
  accountId: string;
  organizationid: string;
  organizationType: string;
  organizationName: string;
  createdAt: string;
  isSuperAdmin?: boolean;
  isDemoAccount?: boolean;
  permissions?: Array<string> | null;
  accountNumber?: string;
  emailId?: string;
}

export interface FormInputTypes {
  error?: boolean;
  value?: any;
}

type BasicPermissionType = "ALL" | "ASSIGNED";
type DashboardType = "LEAD" | "REVENUE" | "PROJECT";
type BillsAndExpensesType = "ALL" | "READ_ONLY" | "WRITE_ONLY";
type InventoryType = "APPROVER" | "REQUESTER";
type PoType = "APPROVER" | "CREATOR";
type EstimatesType = "APPROVER" | "CREATOR";
type ProposalsType = "APPROVER" | "CREATOR";
type BudgetingType = "APPROVER" | "CREATOR" | "MANAGER";
type IndentType = "APPROVER" | "CREATOR";
type GoodsReceiptType = "APPROVER" | "CREATOR";
type UserHubType = "ADMIN" | "EDITOR" | "VIEWER";
type TimeTrackingType = "APPROVER" | "CREATOR";
type TemplateCenterType = "VIEW" | "EDIT";
export interface IFeaturePermissions {
  projects: { type: BasicPermissionType };
  tasks: { type: BasicPermissionType };
  timeTracking: { type: TimeTrackingType };
  defaultDashboard: { type: DashboardType };
  billsAndExpenses: { type: BillsAndExpensesType };
  inventory: { type: InventoryType };
  po: { type: PoType };
  wo: { type: PoType };
  indent: { type: IndentType };
  goodsReceipt?: { type: GoodsReceiptType };
  estimates: { type: EstimatesType };
  proposals: { type: ProposalsType };
  budgeting: { type: BudgetingType };
  userhub: { type: UserHubType };
  templateCenter: { type: TemplateCenterType };
}

export interface UserDataTypes {
  userId: string;
  emailId: string;
  firstName: string;
  lastName: string;
  mobileNumber?: string;
  userStatus: string;
  designation: string;
  isSuperAdmin: boolean;
  permissions?: string[];
  createdAt?: string;
  featurePermissions?: IFeaturePermissions;
}

/** Custom organization role (User Hub → Role Settings). API payloads may use these fields. */
export interface OrganizationRole {
  roleId: string;
  roleName: string;
  description?: string | null;
  userCount?: number;
  /** Assigned user ids for this role (may be null from API). */
  userIds?: string[] | null;
  permissions: string[];
  isDefaultRole?: boolean;
  featurePermissions?: IFeaturePermissions;
  users?: Array<{
    userId: string;
    roleId: string;
    organizationUsersId: string;
  }>;
}

export interface OrganizationTeam {
  id?: number;
  teamId: string;
  organizationId: string;
  branchId: string;
  teamName: string;
  description?: string | null;
  userIds?: string[];
  isDefaultTeam?: boolean;
  automationRoundRobinIndex?: number | null;
  automationRoundRobinLastUserId?: string | null;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string | null;
  updatedAt?: string;
}

export interface OrganizationBranch {
  /** DB primary key (auto-generated). */
  id: number;
  branchId: string;
  organizationId: string;
  branchName: string;
  isDefaultBranch: boolean;
  createdBy: string;
  /** Unix epoch millis. */
  createdAt: number;
  updatedBy?: string | null;
  /** Unix epoch millis. */
  updatedAt: number;
}

export interface CreateLeadTypes {
  leadId: string;
  leadOwner: string;
  leadName: string;
  leadEmail: string;
  leadMobile: string;
  // leadCountryCode?: string;
  leadAddress: string;
  leadCity: string;
  leadState: string;
  leadCountry: string;
  leadZipcode: string;
  projectSource: string;
  projectType: string;
  preferedContactType: string;
  preferedTimeSlot: string;
  projectArea: number;
  projectAreaUnit?: string;
  projectName: string;
  projectBudget: string;
  projectLabels: string;
  // estimatedRevenueFromLead: number;
  // estimatedBudgetFromLead: number;
  // estimatedProfitFromLead: number;
  projectLocation: string;
  projectDescription: string;
  priority: string;
  projectOwnerId: string;
  profileImage?: any;
  isWhatsappActive: boolean;
  isAutomationActive?: boolean;
  // tentativeStartDate: number;
  createdBy: string;
  assignees?: Array<{ id: string; name: string }>;
  projectOwnerName?: string;
  /** Customized lead tags applied at creation (id + display name). */
  leadTags?: Array<{ id: string; name: string }>;
}
export interface CreateLeadCaptureTypes {
  leadId: string;
  leadOwner: string;
  leadName: string;
  leadEmail: string;
  leadMobile: string;
  leadAddress: string;
  leadCity: string;
  leadState: string;
  leadCountry: string;
  leadZipcode: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  projectSource: string;
  projectType: string;
  preferredSlot: any;
  preferedContactType: string;
  preferedTimeSlot: string;
  projectArea: number;
  projectAreaUnit?: string;
  projectLocation: string;
  projectDescription: string;
  priority: string;
  projectOwnerId: string;
  createdBy: string;
  meetingType?: string;
  isWhatsappActive: boolean;
  selectedDate?: any;
  selectedMonth?: any;
  selectedYear?: any;
}

export interface LeadsMasterTypes {
  projectId: string;
  projectOwnerId: string;
  leadName: string;
  projectName: string;
  leadMobile: string;
  isDemoLead?: boolean;
  projectSource: string;
  leadProjectType: string;
  projectType: string;
  projectArea: number;
  projectAreaUnit: string;
  projectLocation: string;
  projectStatus: string;
  snoozedUntil: number;
  createdAt: string;
  leadId: string;
  isSnoozed?: boolean;
  isActive?: boolean;
  assignees?: Array<{ id: string; name: string }>;
  leadTags?: Array<{
    id?: string;
    name?: string;
    leadTagId?: string;
    leadTagName?: string;
  }>;
}

export interface LeadReminderUser {
  id: string;
  name?: string | null;
  [key: string]: any;
}

export interface LeadReminderLead {
  leadId: string;
  leadName?: string | null;
  leadEmail?: string | null;
  leadMobile?: string | null;
  projectId?: string | null;
  [key: string]: any;
}

export interface LeadRemindersTypes {
  reminderId: string;
  leadId: string;
  selectedUsers: LeadReminderUser[];
  reminderDate: number;
  reminderTime: string | number | null;
  status: string;
  isSent: boolean;
  notes?: string | null;
  notificationMethod?: string | null;
  createdUserId?: string | null;
  createdAt: number;
  updatedAt: number;
  updatedBy?: string | null;
  lead?: LeadReminderLead | null;
}

export interface AutomationStep {
  id: string;
  type: "condition" | "action" | "followUp" | "delay";
  config: any;
  parentId?: string;
  branch?: "yes" | "no";
  children?: AutomationStep[];
  /** Schema-driven node config from the workflow details panel (canvas card summary source). */
  workflowPayload?: WorkflowNodePersistedPayload;
}

export interface AutomationDataTypes {
  eventName: string;
  selectedTrigger: {
    triggerType: string;
    triggerSource: string;
    workflowPayload?: WorkflowNodePersistedPayload;
  };
  isEmail: boolean;
  isWhatsapp: boolean;
  isSms: boolean;
  condition: {
    conditionName: string;
    conditionId: string;
    selectedValues: {
      selectedValueId: string;
      selectedValue: string;
    }[];
  }[];
  actions: {
    [key: string]: {
      actionValue: string;
      actionSource: string;
      actionId: string;
      actionEntity: {
        actionEntityId: string;
        actionEntityValue: string;
      };
      notificationTemplate: {
        notificationTemplateId: string;
        notificationTemplateValue: string;
      };
      notificationTemplates?: {
        notificationTemplateId: string;
        notificationTemplateValue: string;
      };
    };
    // whatsapp: Record<string, unknown>;
  };
  followUps: {
    id: any;
    followUpTriggerId: string;
    followUpName: string;
    days: number;
    template: {
      email: {
        templateName: string;
        templateId: string;
      };
    };
  }[];
  updateMileStone: {
    mileStoneName: string;
    mileStoneId: string;
  };
  description: string;
  steps?: AutomationStep[];
}

export interface BoqCreateLibraryItemsDataTypes {
  category?: {
    categoryId: string;
    categoryValue: string;
  };
  subCategory?: {
    subCategoryId: string;
    subCategoryValue: string;
  };
  typeOfWork?: {
    typeOfWorkId: string;
    typeOfWorkValue: string;
  };
  itemId?: string;
  itemName?: string;
  itemDescription?: string;
  itemImages?: string[];
  unit?: {
    unitType?: {
      unitTypeId: string;
      unitTypeName: string;
      unitTypeValue: string;
    };
    unitFormat?: {
      unitFormatId: string;
      unitFormatName: string;
      unitFormatValue: string;
      unitFormatPower: number;
    };
    displayType?: string;
    length?: number;
    width?: number;
    height?: number;
  };
  area?: number;
  itemRatePerUnit?: number;
  materials?: {
    materialId?: string;
    materialName?: string;
    materialDescription?: string;
    materialImage?: string;
    tax?: any;
    alternatives?: {
      productId?: string;

      selected: boolean;

      materialPrice?: number;
      materialTax?: {
        materialTaxValue: number;
        materialTaxUnit: string;
      };
    }[];
    total?: number;
    rate?: number;
    materialPrice?: number;
    quantity?: number;
    materialUnit?: {
      materialUnitId: string;
      materialUnitValue: string;
    };
    priceInclusiveTax?: number;
    materialTotal?: number;
  }[];
  totalPrice?: number;
  updatedAt?: number;
  createdAt?: number;
  scaling?: {
    value?: number; // 111 222 333 eg values
    unit?: string; // L  W H eg unit
  }[];
}
export interface BoqLibraryMyItemResposeType extends Omit<
  BoqCreateLibraryItemsDataTypes,
  "materials"
> {
  materials: string[];
}

export interface LeadTypes {
  leadName: string;
  leadEmail: string;
  leadMobile: string;
  leadAddress: string;
  leadCity: string;
  leadState: string;
  leadCountry: string;
  leadZipcode: string;
  projectSource: string;
  projectType: string;
  projectLocation: string;
  projectStatus: string;
  projectArea: number;
}

export type LeadDetailsTypes = {
  map(arg0: (lead: any) => any): unknown;
  priority?: string;
  eventType: string;
  projectId: string;
  projectName: string;
  projectBudget: string;
  projectLabels: string;
  organizationId: string;
  organizationType: string;
  projectOwner: string;
  projectOwnerId: string;
  projectType: string;
  projectSource: string;
  projectArea: string;
  projectAreaUnit?: string;
  leadSource: string;
  leadProjectType: string;
  assignees?: Array<{ id: string; name: string }>;
  // estimatedBudgetFromLead: number;
  // estimatedRevenueFromLead: number;
  // estimatedProfitFromLead: number;
  // tentativeStartDate: number;
  // desiredCompletionDate: number;
  projectLocation: string;
  projectDescription: string;
  projectStatus: string;
  isSnoozed: boolean;
  isActive: boolean;
  isAutomationActive?: boolean;
  snoozedAt: number;

  createdBy: string;
  createdAt: number;
  updatedBy: string;
  updatedAt: number;
  lead: {
    leadId: string;
    leadName: string;
    leadEmail: string;
    leadMobile: number;
    leadAddress: string;
    leadCity: string;
    leadState: string;
    leadZipcode: number;
    leadCountry: string;
    isDemoLead?: boolean;
    isDummyEmail?: boolean;
    isDummyMobile?: boolean;
    profileImage: string | null;
    preferedContactType: string;
    preferedTimeSlot: string;
    leadTags?: { id: string; name: string }[] | null;
  };
  leadStatusUpdatedAt: number;
  rowStageSelected: any;
  isConvertedToClient?: boolean;
  isProjectScheduleActive?: boolean;
};

export interface clientDetailsTypes extends LeadDetailsTypes {
  isProjectCompleted?: boolean;
  isProjectScheduleActive?: boolean;
}

export interface UserHubDataTypes {
  userId: string;
  emailId: string;
  firstName: string;
  lastName: string;
  userStatus: string;
  designation: string;
  isSuperAdmin: boolean;
  permissions: string[];
  userStatusUpdatedAt: string;
  featurePermissions?: IFeaturePermissions;
}

export interface ActivityLogTypes {
  activityId?: string;
  userId?: string;
  userRole?: string;
  userDesignation?: string;
  organizationId?: string;
  organizationType?: string;
  entityId?: string;
  entityName?: string;
  logEvent?: string;
  logMessage?: string;
  logDescription?: string;
  logType?: string;
  logSource?: string;
  isExistingData?: boolean;
  historicalData?: any;
  currentData?: any;
  requestJson?: any;
  responseJson?: any;
  ipAddress?: any;
  location?: any;
  createdBy?: string;
  createdAt?: number;
  leadId?: string;
  projectId?: string;
  searchField1?: string;
  searchField2?: string;
  isAutomationAction?: boolean;
  performedByType?: "USER" | "AUTOMATION";
}

export interface CallLogTypes {
  callLogRecordingUrl: string | undefined;
  sourceId?: any;
  callLogId?: any;
  organizationId?: any;
  organizationType?: any;
  leadOwner?: any;
  entityId?: any;
  entityName?: any;
  callPurpose: string;
  callLogStatus: string;
  callLogContent: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface OrganizationLocalizationType {
  organizationTimeZoneCultureId: string;
  organizationId: string;
  keyName: string;
  keyType: string;
  value: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string;
}
export interface Res<T> extends Response {
  data?: T | undefined;
}
export type Cloneable = Record<string, any>;

export type LogSourceTypes = "LEAD_MANAGEMENT" | "USERHUB";
export type TypeOfLogTypes = "INTERNAL" | "EXTERNAL";

export type ControlType = {
  controlerName: string;
  label: string[] | string;
  question?: string;
  formControls?: ControlType[];
  isOtherEnabled?: boolean;
  isRequired?: boolean;
  isForm?: boolean;
  isEnabled?: boolean;
  options?: Options[];
  value?: any;
  background?: any;
};

export type SliderControlType = {
  isRequired?: boolean;
  question: string;
  label: string;
  controlerName: "SLIDER_SCALE";
  options: {
    isNumericFormat: boolean;
    startValue: number;
    endValue: number;
    initialPosition: number;
    stepValue: number;
    leftLabel?: string;
    middleLabel?: string;
    rightLabel?: string;
  };
  value: any;
};

export type QuestionerForm = {
  [pageId: string]: {
    pageName: string;
    controls: ControlType[];
  };
};

export type DateTimeType = {
  controlerName: string;
  label: string[] | string;
  question?: string;
  formControls?: ControlType[];
  isOtherEnabled?: boolean;
  isRequired?: boolean;
  isForm?: boolean;
  isEnabled?: boolean;
  options?: {
    isTimeEnable?: boolean;
    format?: string;
    dateRange?: string;
    end?: string;
    start?: string;
  };
  value?: any;
  background?: any;
};

export type MatrixChoice = {
  isRequired?: boolean;
  question: string;
  label: string[] | string;
  controlerName: string[] | string;
  isOtherEnabled?: boolean;
  options: {
    rowLabel: Options[];
    columnLabel: Options[];
  };
};
export type FileUpload = {
  isRequired?: boolean;
  question: string;
  label: string[] | string;
  controlerName: string[] | string;
  isOtherEnabled?: boolean;
  options:
    | {
        fileType: string;
        description: string;
      }[]
    | [];
};
export type AddImage = {
  isRequired?: boolean;
  question: string;
  label: string[] | string;
  controlerName: string[] | string;
  isOtherEnabled?: boolean;
  options:
    | {
        fileName: string;
        fileType: string;
        description: string;
        url: string;
      }[]
    | [];
};
export type MatrixDropdown = {
  isRequired?: boolean;
  question: string;
  label: string[] | string;
  controlerName: string[] | string;
  isOtherEnabled?: boolean;
  options: {
    rowLabel: Options[];
    columnLabel: {
      value: string;
      options?: Options[] | undefined;
      columnSelected?: Options[] | undefined;
      isSelected?: boolean;
    }[];
  };
};

export type Options = {
  value: string;
  columnSelected?: Options[];
  isSelected?: boolean;
  isOther?: boolean;
};

export type ControlComponents = {
  Checkbox: ControlType;
  Radio: ControlType;
  TextShort: ControlType;
  TextLong: ControlType;
  DropdownSingle: ControlType;
  DropdownMulti: ControlType;
  Email: ControlType;
  PhoneNumber: ControlType;
  SliderScale: SliderControlType;
  Form: ControlType;
  DateAndTime: DateTimeType;
  MatrixChoiceSingle: MatrixChoice;
  MatrixChoiceMulti: MatrixChoice;
  MatrixDropdown: MatrixDropdown;
  FileUpload: any;
  AddImage: any;
  RatingScale: any;
  MatrixRatingScale: any;
};

export interface FileData {
  fileName: string;
  fileType: string;
  buffer: ArrayBuffer;
  url: string;
  description: string;
}

export interface MacrosListTypes {
  macrosId: string;
  macroSource: string;
  macroCategory: string;
  macroSubCategory: string;
  macroLabel: string;
  macroParam: string;
  staticMacro?: boolean;
  selectable?: boolean;
  entityId?: string;
  entityColumnName?: string;
  endpoint?: string;
  macroColumnName?: string;
  macroColumnType?: string;
  macroTableName?: string;
  leadProposalId?: string;
  proposalId?: string;
  questionnaireId?: string;
  userId?: string;
  id?: string;
}

export interface LeadProposalDataType {
  _id?: string;
  acceptedAt?: number | null;
  leadSignature?: string | null;
  cameraVerificationUrl?: string | null;
  totalPages?: number | null;
  revisionCount?: number | null;
  pageAnalytics: Array<{
    pageName?: string;
    pageId?: string;
    timeSpent?: number;
    totalViewed?: number;
  }>;
  projectId: string;
  projectName?: string;
  proposalRevision: number;
  leadId: string;
  downloads: number;
  createdBy?: string;
  proposalTemplateId: string;
  organizationId: string;
  organizationType: string;
  proposalTemplateContentUrl: string;
  proposalTitle: string;
  proposalTemplateType: "CUSTOM" | "DEFAULT";
  macros: Array<MacrosListTypes>;
  createdAt?: number;
  updatedAt?: number;
  proposalTemplateDescription?: string;
  expireAt?: number;
  expireAfterCount?: number;
  lastCommentAddedBy?: string;
  lastReminderSent?: number;
  declinedAt?: number;
  lastViewed?: number;
  answeredBy?: string;
  updatedBy?: string;
  deletedAt?: number;
  leadProposalId?: string;
  resent: number;
  reminderSent: number;
  opened: number;
  edited: number;
  isEditable: boolean;
  isConvertedInvoice: boolean;
  pages: Array<ProposalPageType>;
  isAllowDownload?: boolean;
  allowComments?: boolean;
  captureImage?: boolean;
  status: string;
  requesterUserId?: string;
}
export interface TemplateProposalDataType {
  totalPages?: number | null;
  createdBy?: string;
  proposalId?: string;
  organizationId: string;
  organizationType: string;
  proposalTemplateContentUrl?: string;
  proposalTitle: string;
  proposalTemplateType: "CUSTOM" | "DEFAULT";
  macros: Array<MacrosListTypes>;
  createdAt?: number;
  updatedAt?: number;
  proposalTemplateDescription?: string;
  expireAt?: number;
  lastReminderSent?: number;
  declinedAt?: number;
  answeredBy?: string;
  updatedBy?: string;
  deletedAt?: number;
  pages?: Array<ProposalPageType>;
  allowComments?: boolean;
  captureImage?: boolean;
}

export interface ProposalPageType {
  pageId: string;
  pageName: string;
  backgroundImage: string;
  controllers: Array<ProposalControllerType>;
}

const proposalControllerNames = [
  "IMAGE",
  "TEXT",
  "DIVIDER",
  "CHECKBOX",
  "SIGNATURE",
  "TABLE",
  "PRICING_TABLE",
  "TERMS_AND_CONDITIONS",
] as const;

export interface ProposalControllerType {
  controllerId: string;
  controllerName: (typeof proposalControllerNames)[number];
  content?: any[][];
  header?: any[];
  style?: any;
  x?: number;
  y?: number;
  taxes?: Array<{
    taxId: string;
    taxName: string;
    taxRate: number;
    isActive: boolean;
  }>;
  discounts?: Array<{
    discountId: string;
    discountName: string;
    discountRate: number;
    isActive: boolean;
  }>;
}

export interface SuggestionType {
  [controllerId: string]: Array<{
    suggestion: any;
    accepted?: boolean;
    reasonThread?: {
      userId: string;
      userDesignation: string;
      userName: string;
      reason?: any;
    };
  }>;
}

export interface EstimateSuggestionType {
  commentId: string;
  estimateId: string;
  projectId: string;
  leadId?: string;
  id: string;
  idType: "ITEM" | "SECTION";
  clientSuggestion: any;
  acceptedAt?: number;
  declinedAt?: number;
  user?: {
    userId: string;
    userDesignation: string;
    userName: string;
  };
  reply?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface RfqSuggestionType {
  commentId: string;
  vendorRfqLineItemId: string;
  vendorRfqId: string;
  senderId: string;
  senderName: string;
  senderType: string;
  receiverId?: string;
  receiverName: string;
  receiverType: string;
  // id: string;
  // idType: "ITEM" | "SECTION";
  comment: any;
  acceptedAt?: number;
  declinedAt?: number;
  // user?: {
  //   userId: string;
  //   userDesignation: string;
  //   userName: string;
  // };
  reply?: string;
  createdAt?: number;
  updatedAt?: number;
}

export enum PathsKeyForPermission {
  DASHBOARD = "DASHBOARD",
  DASHBOARD_LEAD_DASHBOARD = "DASHBOARD/LEAD_DASHBOARD",
  DASHBOARD_REVENUE_DASHBOARD = "DASHBOARD/REVENUE_DASHBOARD",
  DASHBOARD_PROJECT_MANAGEMENT = "DASHBOARD/PROJECT_DASHBOARD",
  CLIENT = "CLIENT",
  // BOQ = "BOQ",
  MY_PROFILE = "MY_PROFILE",
  MY_ORGANIZATION = "MY_ORGANIZATION",
  ACTIVITY_TRACKER = "ACTIVITY_TRACKER",
  AUTOMATION = "AUTOMATION",
  INTEGRATION = "INTEGRATION",
  SUBSCRIPTION = "SUBSCRIPTION",
  /** Parent token for unified lead + client feature modules (`FEATURES/*`). */
  FEATURES = "FEATURES",
  LEAD_MANAGER = "LEAD_MANAGER",
  USERS = "PEOPLE/USERS",
  VENDORS = "PEOPLE/VENDORS",
  PREFERENCES = "PREFERENCES",
  TEMPLATE_CENTER = "TEMPLATE_CENTER",
  AI_CHAT_BOT = "AI_CHAT_BOT",
  /** Lead CRM feature modules (same `FEATURES/*` strings as client project modules where names match). */
  LEAD_MANAGER_QUESTIONNAIRE = "FEATURES/QUESTIONNAIRE",
  LEAD_MANAGER_FORMS = "FEATURES/FORMS",
  LEAD_MANAGER_FILE_UPLOAD = "FEATURES/FILE_UPLOAD",
  LEAD_MANAGER_NOTES = "FEATURES/NOTES",
  /** Shared feature paths (JWT / User Hub use flat `FEATURES/...`). */
  CLIENT_PROPOSAL = "FEATURES/PROPOSAL",
  CLIENT_ESTIMATION = "FEATURES/ESTIMATION",
  CLIENT_MONEY_MATTERS = "FEATURES/MONEY_MATTERS",
  CLIENT_BILLS_AND_EXPENSES = "FEATURES/BILLS_AND_EXPENSES",

  CLIENT_ESTIMATE = "FEATURES/ESTIMATE",
  CLIENT_TASK_MANAGEMENT = "FEATURES/TASK_MANAGEMENT",
  CLIENT_SELECTIONS = "FEATURES/SELECTIONS",
  CLIENT_INVENTORY = "FEATURES/INVENTORY",
  CLIENT_CALL_LOG = "FEATURES/CALL_LOG",
  CLIENT_ASSETS = "FEATURES/ASSETS",
  CLIENT_WORKERS = "FEATURES/WORKERS",

  CLIENT_COMMUNICATION = "FEATURES/COMMUNICATION",
  CLIENT_DOCUMENT = "FEATURES/DOCUMENT",
  CLIENT_TAKEOFF = "FEATURES/TAKEOFF",
  CLIENT_SCHEDULE = "FEATURES/SCHEDULE",
  CLIENT_BUDGETING = "FEATURES/BUDGETING",
  CLIENT_RFQ = "FEATURES/RFQ",
  CLIENT_PO = "FEATURES/PO",
  CLIENT_WORK_ORDER = "FEATURES/WORK_ORDER",
  CLIENT_INDENT = "FEATURES/INDENT",
  CLIENT_GRN = "FEATURES/GRN",
  CLIENT_TIME_TRACKING = "FEATURES/TIME_TRACKING",
  CLIENT_DAILY_LOG = "FEATURES/DAILY_LOG",
  CLIENT_CLIENT_REPORT = "FEATURES/CLIENT_REPORT",
  CLIENT_EVENT = "FEATURES/EVENT",

  PREFERENCES_ORGANIZATIONS_PREFERENCES = "PREFERENCES/ORGANIZATIONS_PREFERENCES",
  PREFERENCES_PROJECT_CRM = "PREFERENCES/PROJECT_CRM",
  TEMPLATE_CENTER_QUESTIONNAIRE = "TEMPLATE_CENTER/QUESTIONNAIRE",
  TEMPLATE_CENTER_PROPOSAL = "TEMPLATE_CENTER/PROPOSAL",
  TEMPLATE_CENTER_TERMS_and_CONDITIONS = "TEMPLATE_CENTER/TERMS_&_CONDITIONS",
  TEMPLATE_CENTER_NOTIFICATION_TEMPLATES = "TEMPLATE_CENTER/NOTIFICATION_TEMPLATES",
  TEMPLATE_CENTER_TASKS = "TEMPLATE_CENTER/TASKS",
  TEMPLATE_CENTER_SCHEDULE = "TEMPLATE_CENTER/SCHEDULE",
  TEMPLATE_CENTER_BOQ = "TEMPLATE_CENTER/BOQ",
  TEMPLATE_CENTER_ESTIMATE = "TEMPLATE_CENTER/ESTIMATE",
  AI_CHAT_BOT_TRAIN_YOUR_BOT = "AI_CHAT_BOT/TRAIN_YOUR_BOT",
  AI_CHAT_BOT_CHAT_HISTORY = "AI_CHAT_BOT/CHAT_HISTORY",

  MY_VENDOR_INVENTORY = "RESOURCES/INVENTORY",
  MY_VENDOR_SERVICES = "RESOURCES/SERVICES",
  MY_VENDOR_ASSETS = "RESOURCES/ASSETS",

  REPORTS = "REPORTS",

  MY_VENDOR_WORKERS = "RESOURCES/WORKERS",
}

export enum PathKeysForSubscription {
  DASHBOARD = "DASHBOARD",
  MY_PROFILE = "MY_PROFILE",
  MY_ORGANIZATION = "MY_ORGANIZATION",
  ACTIVITY_TRACKER = "ACTIVITY_TRACKER",
  AUTOMATION = "AUTOMATION",
  INTEGRATION = "INTEGRATION",
  SUBSCRIPTION = "SUBSCRIPTION",
  LEAD_MANAGER = "LEAD_MANAGER",
  USER_HUB = "USER_HUB",
  PREFERENCES = "PREFERENCES",
  LOCALIZATION = "LOCALIZATION",
  TEMPLATE_CENTER = "TEMPLATE_CENTER",
  AI_CHAT_BOT = "AI_CHAT_BOT",
}

export interface ActionResponseType {
  actionId: string;
  actionSource: string;
  actionValue: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string;
}

export interface TriggerReponseType {
  conditionColumn1: string | null;
  conditionColumn2: string | null;
  conditionColumn3: string | null;
  conditionColumn4: string | null;
  conditionValue1: string | null;
  conditionValue2: string | null;
  conditionValue3: string | null;
  conditionValue4: string | null;
  createdAt: string;
  createdBy: string;
  emailTemplateId: string;
  emailTemplateName: string;
  emailType: string;
  followUpDays: string | null;
  followUpName: string | null;
  followUpSetId: string | null;
  followUpSetOrder: string | null;
  followUpTemplateId: string | null;
  isActive: boolean;
  isChangeStage: boolean;
  isChangeStatus: boolean;
  isFollowUpTrigger: boolean;
  isSendEmail: boolean;
  isSendRemainder: boolean;
  lastReadAt: string;
  linkTemplateId: string | null;
  linkTemplateName: string | null;
  organizationId: string;
  organizationType: string;
  remainderTemplateId: string | null;
  targetStage: string | null;
  targetStatus: string;
  triggerDesc: string;
  triggerEventSource: string;
  triggerEventType: string;
  triggerId: string;
  triggerName: string;
  triggerType: string;
  updatedAt: string;
  updatedBy: string | null;
}
export interface GeoIPResType {
  continent: {
    code: string;
    geonameId: number;
    names: {
      [key: string]: string;
    };
  };
  country: {
    isoCode: string;
    geonameId: number;
    names: {
      [key: string]: string;
    };
  };
  maxmind: { queriesRemaining: number };
  registeredCountry: {
    isoCode: string;
    geonameId: number;
    names: {
      [key: string]: string;
    };
    isInEuropeanUnion: boolean;
  };
  representedCountry: any;
  city: {
    geonameId: number;
    names: {
      [key: string]: string;
    };
  };
  location: {
    accuracyRadius: number;
    latitude: number;
    longitude: number;
    timeZone: string;
  };
  postal: { code: string };
  subdivisions: [{ isoCode: string; geonameId: number; names: any }];
  traits: {
    ipAddress: string;
  };
}

export interface AIGeneratorRequestType {
  organizationId: string;
  organizationType: string;
  organizationName: string;
  query: string;
  creativity: string;
  language: string;
  currency: string;
  countryCode?: string;
  geometry_type?: "area" | "linear";
  canvas_inputs_used?: Array<{
    label: string;
    computeToken: string;
  }>;
}
export type AICreativityOptionsType = "HIGH" | "MEDIUM" | "LOW";

export enum AIInsertDataEventTypes {
  PROPOSAL_INSERT_DATA = "PROPOSAL_INSERT_DATA",
  QUESTIONNAIRE_INSERT_DATA = "QUESTIONNAIRE_INSERT_DATA",
  ESTIMATE_INSERT_DATA = "ESTIMATE_INSERT_DATA",
  ITEMS_INSERT_DATA = "ITEMS_INSERT_DATA",
  SCHEDULE_INSERT_DATA = "SCHEDULE_INSERT_DATA",
  NOTIFICATION_TEMPLATES_INSERT_DATA = "NOTIFICATION_TEMPLATES_INSERT_DATA",
  PROFESSIONAL_SUMMARY_INSERT_DATA = "PROFESSIONAL_SUMMARY_INSERT_DATA",
  CUSTOM_ASSEMBLY_INSERT_DATA = "CUSTOM_ASSEMBLY_INSERT_DATA",
}

export interface OrganizationSubscriptionDetailsType {
  organizationSubscriptionId: string;
  organizationId: string;
  subscriptionPlanId: string;
  isSubscriptionPlanActive: boolean;
  subscriptionValidFrom: number;
  subscriptionValidTill: number;
  paymentTenure: string;
  isRecurringAutoDebit: boolean;
  isAutoDebitInitiated: boolean;
  autoDebitInitiatedAt?: number;
  isAutoDebitCompleted?: boolean;
  autoDebitCompletedAt?: number;
  isDeactivated?: boolean;
  isFreeTrial?: boolean;
  licenseCount?: number;
  licenseCountUsed?: number;
  createdBy: string;
  createdAt: number;
  updatedAt?: number;
  updatedBy?: string;
}

export interface SubscriptionPlanDetailsType {
  planId: string;
  planName: string;
  displayName: string;
  billingType: string;
  billingPeriod: number;
  billingValue: number;
  currency: string;
  planDesc?: string;
  isCustom: boolean;
  discountValue?: number;
  discountUnit?: "AMOUNT" | "PERCENTAGE";
  isFreemium: boolean;
}

export interface PaymentMethodType {
  opmdId: string;
  organizationId: string;
  customerId: string;
  paymentGateway: string;
  paymentMethodType: string;
  paymentMethodId: string;
  isPrimary: boolean;
  isActive: boolean;
  isEmandateRequired: boolean;
  emandateId?: string;
}

export interface StripePaymentMethodResponse {
  id: string;
  object: string;
  allow_redisplay: string;
  billing_details: any;
  card: {
    brand: string;
    checks: any;
    country: string;
    display_brand: string;
    exp_month: number;
    exp_year: number;
    fingerprint: string;
    funding: string;
    last4: string;
    three_d_secure_usage: {
      supported: boolean;
    };
    wallet: any;
  };
  created: number;
  customer: number;
  livemode: boolean;
  metadata: any;
  radar_options: any;
  type: "card";
}

export interface LineItem {
  id: string;
  name: string;
  description: string;
  qty: number;
  unit: string;
  ratePerUnit: number;
  profit: number;
  rateIncluProfit: number;
  totalCost: number;
  rateIncluTax: number;
  labour?: number;
}

export interface Section {
  name?: string;
  _id?: string;
}
export type ExpandedSections = {
  [key: string]: boolean;
};

export interface BoqTemplateSectionType {
  sectionName?: string;
  sectionId?: string;
  sectionItems?: Array<BoqTemplateSectionItemType>;
}
export interface BoqTemplateSectionItemType {
  itemName?: string;
  itemImage?: string;
  sectionItemId?: string;
  itemDescription?: string;
  price?: number;
  ratePerUnit?: number;
  powerValue?: number;
  rateIncluProfit?: number;
  totalCost?: number;
  unit?: string;
  profitMarkup?: number;
  profitMarkupType?: "PERCENTAGE" | "FIXED";
  quantity?: number;
  startDate?: string;
  duration?: number;
  endDate?: string;
  materials?: any[];
}

export interface BoqClientEstimateSectionItemType extends BoqTemplateSectionItemType {
  leadId?: string;
  projectId?: string;
  materials?: any[];
  sectionId?: string;
}

export interface BoqClientEstimateSectionType extends BoqTemplateSectionType {
  sectionName?: string;
  leadId?: string;
  projectId?: string;
  position?: number;
}

export interface BoqTemplateResponseType {
  templateId: string;
  sectionIds: string[];
  organizationId?: string;
  hidden?: boolean;
  columns?: any;
  organizationType?: string;
  type: string;
  categoryValue: string;
  categoryId: string;
  subCategoryId: string;
  subCategoryValue: string;
  templateName: string;
  templateDescription?: any;
  createdAt?: number;
  updatedAt?: number;
}
export interface BoqEstimateOtherChargesType {
  _id?: string;
  otherChargeId?: string;
  organizationId?: string;
  organizationType?: string;
  estimateId?: string;
  amountValue?: number;
  chargeName?: string;
  amountUnit?: "FIXED" | "PERCENTAGE";
}

export interface BoqClientEstimateResponseType extends Omit<
  BoqTemplateResponseType,
  | "templateId"
  | "hidden"
  | "type"
  | "categoryValue"
  | "categoryId"
  | "subCategoryValue"
  | "subCategoryId"
  | "templateName"
  | "templateDescription"
  | "sectionIds"
> {
  leadId?: string;
  projectId?: string;
  estimateId?: string;
  estimateRevision?: number;
  templateId?: string;
  estimateTitle?: string;
  estimateDescription?: string;
  estimateCreatedOn?: number;
  estimateValidTill?: number;
  estimationSerial?: {
    serialId?: string;
    serialNumber: number;
    serialPrefix: string;
  };
  notes?: any;
  total?: number;
  totalProfit?: number;
  discountApplied?: { discountName: string; discountValue: number }[];
  taxApplied?: { taxName: string; taxValue: number }[];
  grandTotal?: number;
  subTotal?: number;
  clientSignature?: string;
  cameraVerificationUrl?: string;
  sections?: string[];
  otherCharges?: BoqEstimateOtherChargesType[];
  acceptedAt?: number;
  acceptedBy?: "CLIENT" | "ADMIN";
  declinedAt?: number;
  declineReason?: string;
  downloads?: number;
  viewed?: number;
  lastViewedAt?: number;
  isSent?: boolean;
  isSentAsBoq?: boolean;
  isTaxDisplay?: boolean;
  leadSignature?: string;
  isRoundedUp?: boolean;
  isAdminSignatureVisible?: boolean;
  approvedBy?: {
    userName: string;
    userId: string;
  };
  edited?: number;
  lastEditedAt?: number;
  approvedAt?: number;
  totalTimeSpent?: number;
  isConvertedInvoice?: boolean;
  columns?: ColumnDefinition[];
  budgetingLabel?: string;
  budgetingStatus?: string;
  budgetingStatusUpdatedAt?: number;
  budgetingStatusUpdatedById?: string;
  linkedPlannedCostId?: string;
  allowComments?: boolean;
  captureImage?: boolean;
}

export interface BoqClientEstiamteSectionResponseType {
  sectionName?: string;
  leadId?: string;
  projectId?: string;
  createdAt: number;
  updatedAt: number;
  sectionItems: BoqClientEstimateSectionItemResponseType[] | [];
  organizationId: string;
  organizationType: string;
  estimateId: string;
  sectionId: string;
}

export interface BoqClientEstimateSectionItemResponseType {
  projectId: string;
  leadId: string;
  itemEntityId?: string;
  itemEntityType?: "PRODUCT" | "VENDOR" | "LIBRARY" | "MY_ITEM";
  scaling?: [
    {
      value: any;
      unit: string;
    },
  ];
  materials?: Material[];
  unitType?: {
    itemUnitName: string;
    itemUnitValue: string;
  };
  format?: {
    formatValue: string;
    powerName: string;
    powerValue: number;
  };
  itemImages?: string[];
  sectionId: string;
  sectionItemId: string; //index
  itemName: string;
  itemDescription: string;
  ratePerUnit: number; //itemPrice (MyItems)
  rateInclProfit: number;
  unit: string;
  profitMarkUp: number;
  quantity: number;
  labour?: number;
  totalCost: number;
  [customColumnValue: string]: any;
}
export interface BoqClientEstimationDataType extends Omit<
  BoqClientEstimateResponseType,
  "sections"
> {
  sections?: Array<BoqClientEstimateSectionType>;
  communicationMode?: "EMAIL" | "WHATSAPP" | "SMS";
}

export interface ColumnDefinition extends Omit<
  Column<BoqTemplateSectionItemType>,
  "Header"
> {
  columnLabel: string;
  columnValue: string;
  accessor: keyof BoqTemplateSectionItemType;
  fixedOrder?: boolean;
  disabled?: boolean;
  columnId?: string;
  calcConfig?: any;
  hidden?: boolean;
  isCustomColumn?: boolean;
  showToCustomer?: boolean;
  showToLineItem?: boolean;
  dataType?: string;
}

export interface ConnectedOrganizationType {
  connectedOrganizationId: string;
  sourceOrganizationId: string;
  sourceOrganizationType: string;
  destinationOrganizationType: string;
  destinationOrganizationId: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string;
  status: "ACCEPTED" | "PENDING";
  superAdminUser: {
    id: number;
    organizationUsersId: string;
    accountId: string;
    organizationId: string;
    organizationType: string;
    userId: string;
    isSuperAdmin: boolean;
    permissions: [];
    userStatus: "ACCEPTED" | "PENDING";
    designation: string;
    createdBy: string;
    createdAt: string;
    updatedBy: string | null;
    updatedAt: string;
    userStatusUpdatedAt: string;
    deletedAt: string | null;
    userDetails: UserDataTypes;
  };
  organization: {
    organizationId: string;
    organizationName: string;
  };
  organizationInformationDetails: {
    taxId?: string;
    taxName?: string;
  };
}

export type Tool =
  | "none"
  | "select"
  | "room-select"
  | "count"
  | "measure"
  | "scale"
  | "circle"
  | "square"
  | "line"
  | "polygon"
  | "annotation"
  | "delete"
  | "component-detect"
  | "deduction-square"
  | "deduction-polygon";

export interface OrganizationWorkerType {
  createdAt: string;
  createdBy: string;
  description: string | null;
  isActive: boolean;
  organizationId: string;
  organizationType: string;
  organizationWorkerType: string;
  organizationWorkerTypeDisplayName: string;
  organizationWorkerTypeId: string;
  updatedAt: string;
  updatedBy: string;
}
