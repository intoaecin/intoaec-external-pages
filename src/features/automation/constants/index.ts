// ─────────────────────────────────────────────────────────────────────────────
// NEW SCHEMA — schema-driven workflow registry
// ─────────────────────────────────────────────────────────────────────────────

export type WorkflowNodeType = "TRIGGER" | "CONDITION" | "ACTION" | "DELAY";

export type FieldType =
  | "text"
  | "number"
  | "select"
  | "multi-select"
  | "radio"
  | "textarea"
  | "date"
  | "switch"
  | "hidden";

export interface WorkflowFieldOption {
  label: string;
  value: string;
}

/** Select options loaded at runtime (see `TriggerDetailsDialog` and related consumers). */
export type WorkflowFieldOptionsSource =
  | "customizedLeadStages"
  | "customizedProjectTypes"
  | "customizedLeadTags"
  | "notificationTemplates"
  | "organizationUsers"
  | "organizationTeams"
  | "leadSources"
  | "whatsappQuickReplyButtons";

/**
 * How to turn raw option tokens into display text in the UI.
 * `seedValues` → `formatSeedValues` from `@/lib/helpers` (e.g. `SCHEDULED_MEETING` → "Scheduled Meeting").
 */
export type WorkflowFieldOptionLabelFormat = "seedValues";

export interface WorkflowField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  options?: WorkflowFieldOption[];
  optionsSource?: WorkflowFieldOptionsSource;
  optionLabelFormat?: WorkflowFieldOptionLabelFormat;
  /**
   * When `optionsSource` is set, drops any option whose `value` equals the current value
   * of this sibling field (e.g. hide selected "from" stage in "to" stage list).
   */
  excludeValuesFromFieldKey?: string;
  /**
   * When `optionsSource` is `customizedLeadStages`, include terminal stages (`WON` / `LOST`).
   * Triggers omit them by default; conditions include them.
   */
  includeTerminalLeadStages?: boolean;
  /** When `optionsSource` is `organizationUsers`, allow only one user (recipient picker). */
  singleUserSelect?: boolean;
  /** When `optionsSource` is `organizationUsers`, persist `userId` instead of email. */
  useOrganizationUserId?: boolean;
  /** i18n key for an info icon tooltip beside the field label. */
  infoTooltipI18nKey?: string;
}

export interface WorkflowMethod {
  key: string;
  label: string;
  description?: string;
  fields: WorkflowField[];
}

export interface WorkflowNodeRegistry {
  type: WorkflowNodeType;
  methods: WorkflowMethod[];
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED OPERATOR SETS
// ─────────────────────────────────────────────────────────────────────────────

const EQUALITY_OPS: WorkflowFieldOption[] = [
  { label: "Equals", value: "===" },
  { label: "Not Equals", value: "!==" },
];

const COMPARISON_OPS: WorkflowFieldOption[] = [
  { label: "Greater Than", value: ">" },
  { label: "Less Than", value: "<" },
  { label: "Greater Than or Equal", value: ">=" },
  { label: "Less Than or Equal", value: "<=" },
];

const NUMERIC_OPS: WorkflowFieldOption[] = [
  ...COMPARISON_OPS,
  // ...EQUALITY_OPS,
  // { label: "Between", value: "BETWEEN" },
  // { label: "Is Empty", value: "IS_EMPTY" },
  // { label: "Is Not Empty", value: "IS_NOT_EMPTY" },
];

const TASK_DUE_DATE_OFFSET_OPTIONS: WorkflowFieldOption[] = [
  { label: "1 week", value: "1_WEEK" },
  { label: "2 weeks", value: "2_WEEKS" },
  { label: "3 weeks", value: "3_WEEKS" },
  { label: "4 weeks", value: "4_WEEKS" },
];

const REMINDER_OFFSET_OPTIONS: WorkflowFieldOption[] = [
  { label: "1 day", value: "1_DAY" },
  { label: "3 days", value: "3_DAYS" },
  { label: "1 week", value: "1_WEEK" },
  { label: "2 weeks", value: "2_WEEKS" },
];

const REMINDER_TIME_OF_DAY_OPTIONS: WorkflowFieldOption[] = [
  { label: "9:00 AM", value: "09:00" },
  { label: "10:00 AM", value: "10:00" },
  { label: "11:00 AM", value: "11:00" },
  { label: "12:00 PM", value: "12:00" },
  { label: "1:00 PM", value: "13:00" },
  { label: "2:00 PM", value: "14:00" },
  { label: "3:00 PM", value: "15:00" },
  { label: "4:00 PM", value: "16:00" },
  { label: "5:00 PM", value: "17:00" },
  { label: "6:00 PM", value: "18:00" },
];

const TASK_PRIORITY_OPTIONS: WorkflowFieldOption[] = [
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low", value: "LOW" },
];

const STRING_OPS: WorkflowFieldOption[] = [
  ...EQUALITY_OPS,
];

const CUSTOMIZED_LEAD_STATUS_FIELD = {
  type: "select" as const,
  required: true,
  optionsSource: "customizedLeadStages" as const,
  optionLabelFormat: "seedValues" as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// FULL AEC WORKFLOW REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const WORKFLOW_REGISTRY: WorkflowNodeRegistry[] = [
  // ── TRIGGERS ────────────────────────────────────────────────────────────────
  {
    type: "TRIGGER",
    methods: [
      {
        key: "LEAD_STATUS_CHANGED_TO",
        label: "Status Changed To",
        description: "Lead moves INTO a specific status",
        fields: [
          {
            key: "statusChangedTo",
            label: "Status",
            ...CUSTOMIZED_LEAD_STATUS_FIELD,
          },
        ],
      },
      {
        key: "LEAD_STATUS_CHANGED_FROM",
        label: "Status Changed From",
        description: "Lead moves OUT OF a specific status",
        fields: [
          {
            key: "statusChangedFrom",
            label: "Status",
            ...CUSTOMIZED_LEAD_STATUS_FIELD,
          },
        ],
      },
      {
        key: "INACTIVE_STATUS",
        label: "Inactive In Status",
        description: "No activity for N days in a status",
        fields: [
          {
            key: "status",
            label: "Status",
            ...CUSTOMIZED_LEAD_STATUS_FIELD,
          },
          {
            key: "inactiveDays",
            label: "Inactive days",
            type: "number",
            required: true,
            min: 1,
            max: 365,
            placeholder: "e.g. 7",
          },
        ],
      },
      {
        key: "LEAD_LOCKED",
        label: "Lead Locked",
        description: "No status change for N days",
        fields: [
          {
            key: "days",
            label: "Locked after days",
            type: "number",
            required: true,
            min: 1,
            max: 365,
            placeholder: "e.g. 7",
          },
        ],
      },
      {
        key: "LEAD_CREATED",
        label: "Lead Created",
        description: "A new lead is added to the system",
        fields: [],
      },
      {
        key: "LEAD_CAPTURE_FORM_SENT",
        label: "Lead Capture Form Sent",
        description: "When a lead capture form is sent to a lead",
        fields: [],
      },
    ],
  },

  // ── CONDITIONS ───────────────────────────────────────────────────────────────
  {
    type: "CONDITION",
    methods: [
      {
        key: "PROJECT_TYPE",
        label: "Project Type",
        fields: [
          { key: "operator", label: "Operator", type: "select", options: STRING_OPS },
          {
            key: "value",
            label: "Project Type",
            type: "multi-select",
            optionsSource: "customizedProjectTypes",
            optionLabelFormat: "seedValues",
          },
        ],
      },
      {
        key: "PROJECT_STATUS",
        label: "Project Status",
        fields: [
          { key: "operator", label: "Operator", type: "select", options: EQUALITY_OPS },
          {
            key: "value",
            label: "Status",
            type: "multi-select",
            optionsSource: "customizedLeadStages",
            optionLabelFormat: "seedValues",
            includeTerminalLeadStages: true,
          },
        ],
      },
      {
        key: "PROJECT_BUDGET",
        label: "Project Budget",
        fields: [
          { key: "operator", label: "Operator", type: "select", options: NUMERIC_OPS },
          { key: "value", label: "Budget Value", type: "number", placeholder: "e.g. 1000000" },
        ],
      },
      {
        key: "LEAD_SOURCE",
        label: "Lead Source",
        fields: [
          { key: "operator", label: "Operator", type: "select", options: EQUALITY_OPS },
          {
            key: "value",
            label: "Lead Source",
            type: "multi-select",
            optionsSource: "leadSources",
          },
        ],
      },
      {
        key: "LEAD_CAPTURE",
        label: "Lead Capture",
        fields: [
          { key: "operator", label: "Operator", type: "select", options: EQUALITY_OPS },
          {
            key: "value",
            label: "Value",
            type: "radio",
            options: [
              { label: "Yes", value: "YES" },
              { label: "No", value: "NO" },
            ],
          },
        ],
      },
      {
        key: "WHATSAPP_BUTTON_REPLY",
        label: "WhatsApp Button Response",
        fields: [
          { key: "sourceWhatsappNodeId", label: "Source WhatsApp Node", type: "hidden" },
          {
            key: "yesButtonText",
            label: "Yes branch button",
            type: "select",
            required: true,
            optionsSource: "whatsappQuickReplyButtons",
          },
          {
            key: "noButtonText",
            label: "No branch button",
            type: "select",
            required: true,
            optionsSource: "whatsappQuickReplyButtons",
          },
        ],
      },
    ],
  },

  // ── ACTIONS ──────────────────────────────────────────────────────────────────
  {
    type: "ACTION",
    methods: [
      {
        key: "SEND_EMAIL",
        label: "Send Email",
        fields: [
          {
            key: "recipientType",
            label: "Recipient Type",
            type: "select",
            required: true,
            options: [
              { label: "Client", value: "CLIENT" },
              { label: "Users", value: "USERS" },
            ],
          },
          {
            key: "recipientEmail",
            label: "Recipient",
            type: "select",
            optionsSource: "organizationUsers",
            singleUserSelect: true,
            required: true,
            placeholder: "Select user",
          },
          {
            key: "emailTemplate",
            label: "Email Template",
            type: "select",
            required: true,
            optionsSource: "notificationTemplates",
          },
          {
            key: "cc",
            label: "CC",
            type: "multi-select",
            optionsSource: "organizationUsers",
            placeholder: "Select users to CC",
          },
        ],
      },
      {
        key: "SEND_WHATSAPP",
        label: "Send WhatsApp",
        fields: [
          {
            key: "recipientType",
            label: "Recipient Type",
            type: "select",
            required: true,
            options: [
              { label: "Client", value: "CLIENT" },
              { label: "Users", value: "USERS" },
            ],
          },
          {
            key: "phoneNumber",
            label: "Phone Number (example: +91XXXXXXXXXX)",
            type: "text",
            required: true,
            placeholder: "+91XXXXXXXXXX",
          },
          {
            key: "whatsappTemplate",
            label: "WhatsApp Template",
            type: "select",
            required: true,
            optionsSource: "notificationTemplates",
          },
        ],
      },
      {
        key: "CREATE_TASK",
        label: "Create Task",
        fields: [
          {
            key: "taskHeader",
            label: "Task name",
            type: "text",
            required: true,
            placeholder: "e.g. Follow up with client",
          },
          {
            key: "taskDescription",
            label: "Description",
            type: "textarea",
            placeholder: "Optional task details",
          },
          {
            key: "dueDateOffset",
            label: "Due date",
            type: "select",
            required: true,
            options: TASK_DUE_DATE_OFFSET_OPTIONS,
          },
          {
            key: "taskAssignees",
            label: "Assignees",
            type: "multi-select",
            optionsSource: "organizationUsers",
            useOrganizationUserId: true,
            placeholder: "Select assignees (optional)",
          },
          {
            key: "taskPriority",
            label: "Priority",
            type: "select",
            options: TASK_PRIORITY_OPTIONS,
          },
        ],
      },
      {
        key: "SET_LEAD_REMINDER",
        label: "Set Lead Reminder",
        fields: [
          {
            key: "selectedUsers",
            label: "Notify users",
            type: "multi-select",
            required: true,
            optionsSource: "organizationUsers",
            useOrganizationUserId: true,
            placeholder: "Select users",
          },
          {
            key: "reminderOffset",
            label: "Reminder date",
            type: "select",
            required: true,
            options: REMINDER_OFFSET_OPTIONS,
          },
          {
            key: "reminderTimeOfDay",
            label: "Reminder time",
            type: "select",
            required: true,
            options: REMINDER_TIME_OF_DAY_OPTIONS,
          },
          {
            key: "notificationMethod",
            label: "Delivery method",
            type: "radio",
            required: true,
            options: [
              { label: "App notification", value: "APP_NOTIFICATION" },
              {
                label: "App notification and email",
                value: "APP_NOTIFICATION_EMAIL",
              },
            ],
          },
          {
            key: "notes",
            label: "Notes",
            type: "textarea",
            placeholder: "Optional reminder notes",
          },
        ],
      },
      {
        key: "UPDATE_LEAD_STAGE",
        label: "Update Lead Stage",
        fields: [
          {
            key: "projectStatus",
            label: "Lead stage",
            type: "select",
            required: true,
            optionsSource: "customizedLeadStages",
            optionLabelFormat: "seedValues",
          },
        ],
      },
      {
        key: "ADD_LEAD_TAGS",
        label: "Add Lead Tags",
        fields: [
          {
            key: "leadTagIds",
            label: "Tags",
            type: "multi-select",
            required: true,
            optionsSource: "customizedLeadTags",
            placeholder: "Select tags to add",
          },
        ],
      },
      {
        key: "ASSIGN_USERS",
        label: "Lead Assignees & Reporters",
        fields: [
          {
            key: "assignees",
            label: "Assignees",
            type: "multi-select",
            required: true,
            optionsSource: "organizationUsers",
            useOrganizationUserId: true,
            placeholder: "Select assignees",
          },
          {
            key: "reporterSource",
            label: "Reporter source",
            type: "radio",
            required: true,
            options: [
              { label: "By team", value: "TEAM" },
              { label: "By user", value: "USER" },
            ],
          },
          {
            key: "teamId",
            label: "Team",
            type: "select",
            required: true,
            optionsSource: "organizationTeams",
            placeholder: "Select team",
            infoTooltipI18nKey:
              "automation.workflowFields.tooltips.assignUsersTeam",
          },
          {
            key: "teamDistributionMethod",
            label: "Distribution method",
            type: "radio",
            required: true,
            infoTooltipI18nKey:
              "automation.workflowFields.tooltips.teamDistributionMethod",
            options: [
              { label: "Least lead count", value: "LEAST_COUNT" },
              { label: "Round robin", value: "ROUND_ROBIN" },
            ],
          },
          {
            key: "reporterId",
            label: "Reporter",
            type: "select",
            required: true,
            optionsSource: "organizationUsers",
            useOrganizationUserId: true,
            singleUserSelect: true,
            placeholder: "Select reporter",
          },
        ],
      },
    ],
  },

  // ── DELAYS ───────────────────────────────────────────────────────────────────
  {
    type: "DELAY",
    methods: [
      {
        key: "WAIT",
        label: "Wait",
        fields: [
          {
            key: "days",
            label: "Number of days",
            type: "number",
            required: true,
            min: 1,
            max: 365,
            placeholder: "e.g. 3",
          },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Display order for trigger event category filter chips (Lead management → Questionnaire → Proposal). */
export const TRIGGER_EVENT_SOURCE_DISPLAY_ORDER = [
  "LEAD_MANAGEMENT",
  "QUESTIONNAIRE",
  "PROPOSAL",
  "ESTIMATE",
  "MEET_AND_NOTE",
] as const;

export type TriggerEventSourceKey =
  (typeof TRIGGER_EVENT_SOURCE_DISPLAY_ORDER)[number];

/** Sort unique trigger `eventSource` values for category chips; unknown sources appear last. */
export function sortTriggerEventSources(sources: Iterable<string>): string[] {
  const unique = [...new Set(sources)].filter(Boolean);
  const order = TRIGGER_EVENT_SOURCE_DISPLAY_ORDER;
  return unique.sort((a, b) => {
    const ai = order.indexOf(a as TriggerEventSourceKey);
    const bi = order.indexOf(b as TriggerEventSourceKey);
    const aRank = ai === -1 ? order.length : ai;
    const bRank = bi === -1 ? order.length : bi;
    if (aRank !== bRank) return aRank - bRank;
    return a.localeCompare(b);
  });
}

export function getWorkflowNodeRegistry(type: WorkflowNodeType): WorkflowNodeRegistry | undefined {
  return WORKFLOW_REGISTRY.find((r) => r.type === type);
}

export function getWorkflowMethod(type: WorkflowNodeType, methodKey: string): WorkflowMethod | undefined {
  return getWorkflowNodeRegistry(type)?.methods.find((m) => m.key === methodKey);
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY EXPORTS — kept for backward compatibility with canvas / autocomplete
// ─────────────────────────────────────────────────────────────────────────────

export const TRIGGER_CARD_METHOD = [
  {
    key: "TRIGGER",
    options: WORKFLOW_REGISTRY.find((r) => r.type === "TRIGGER")!.methods.map((m) => m.key),
  },
  {
    key: "CONDITION",
    options: WORKFLOW_REGISTRY.find((r) => r.type === "CONDITION")!.methods.map((m) => m.key),
  },
  {
    key: "ACTION",
    options: WORKFLOW_REGISTRY.find((r) => r.type === "ACTION")!.methods.map((m) => m.key),
  },
  {
    key: "DELAY",
    options: WORKFLOW_REGISTRY.find((r) => r.type === "DELAY")!.methods.map((m) => m.key),
  },
] as const;

export type AutomationCardMethodKey = (typeof TRIGGER_CARD_METHOD)[number]["key"];

/**
 * i18n keys for the workflow "add next node" popover — same copy as `TriggerCard` `tipText`
 * (`automation.workflowCanvas.tipCriteria` / `tipAction`).
 */
export const WORKFLOW_ADD_NODE_POPOVER_DESCRIPTION_I18N_KEY: Record<
  Exclude<AutomationCardMethodKey, "TRIGGER">,
  string
> = {
  CONDITION: "automation.workflowCanvas.tipCriteria",
  DELAY: "automation.workflowCanvas.tipDelay",
  ACTION: "automation.workflowCanvas.tipAction",
};

export type AutomationFieldType = "select" | "number" | "text";

export interface AutomationFieldDef {
  key: string;
  labelKey: string;
  type: AutomationFieldType;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
}

export interface AutomationMethodFieldsDef {
  key: string;
  offCanvas: boolean;
  fields: AutomationFieldDef[];
}

/** Legacy field lookup — maps WORKFLOW_REGISTRY into old format for any consumers. */
function registryToLegacyFields(type: WorkflowNodeType): AutomationMethodFieldsDef[] {
  return (
    getWorkflowNodeRegistry(type)?.methods.map((method) => ({
      key: method.key,
      offCanvas: true,
      fields: method.fields.map((f) => ({
        key: f.key,
        labelKey: f.key,
        type: (f.type === "number"
          ? "number"
          : (f.type === "select" || f.type === "multi-select" || f.type === "radio") &&
              (f.options?.length ||
                f.optionsSource === "customizedLeadStages" ||
                f.optionsSource === "customizedProjectTypes" ||
                f.optionsSource === "customizedLeadTags" ||
                f.optionsSource === "notificationTemplates" ||
                f.optionsSource === "leadSources" ||
                f.optionsSource === "organizationTeams")
            ? "select"
            : "text") as AutomationFieldType,
        options: f.options,
      })),
    })) ?? []
  );
}

export const TRIGGER_FIELDS: AutomationMethodFieldsDef[] = registryToLegacyFields("TRIGGER");
export const CONDITION_FIELDS: AutomationMethodFieldsDef[] = registryToLegacyFields("CONDITION");
export const ACTION_FIELDS: AutomationMethodFieldsDef[] = registryToLegacyFields("ACTION");
export const DELAY_FIELDS: AutomationMethodFieldsDef[] = registryToLegacyFields("DELAY");

const METHOD_FIELDS_BY_CARD: Record<AutomationCardMethodKey, AutomationMethodFieldsDef[]> = {
  TRIGGER: TRIGGER_FIELDS,
  CONDITION: CONDITION_FIELDS,
  ACTION: ACTION_FIELDS,
  DELAY: DELAY_FIELDS,
};

export function getMethodOptionsForCard(cardMethod: AutomationCardMethodKey): readonly string[] {
  const entry = TRIGGER_CARD_METHOD.find((row) => row.key === cardMethod);
  return entry?.options ?? [];
}

export function getFieldsDefinitionForMethodOption(
  cardMethod: AutomationCardMethodKey,
  optionKey: string
): AutomationMethodFieldsDef | undefined {
  return METHOD_FIELDS_BY_CARD[cardMethod]?.find((def) => def.key === optionKey);
}
