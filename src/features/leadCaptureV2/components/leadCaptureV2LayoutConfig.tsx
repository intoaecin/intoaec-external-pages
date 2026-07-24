import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CelebrationOutlinedIcon from "@mui/icons-material/CelebrationOutlined";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import ChecklistRtlOutlinedIcon from "@mui/icons-material/ChecklistRtlOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import NumbersOutlinedIcon from "@mui/icons-material/NumbersOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import RadioButtonCheckedOutlinedIcon from "@mui/icons-material/RadioButtonCheckedOutlined";
import ShortTextOutlinedIcon from "@mui/icons-material/ShortTextOutlined";
import StraightenOutlinedIcon from "@mui/icons-material/StraightenOutlined";
import ToggleOnOutlinedIcon from "@mui/icons-material/ToggleOnOutlined";
import WavingHandOutlinedIcon from "@mui/icons-material/WavingHandOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import SignatureIcon from "@/assets/icons/signature-icon";

export type LeadCaptureV2StepId =
  | "welcome"
  | "leadCapture"
  | "serviceTypes"
  | "slotSetup"
  | "thankYou";

export type LeadCaptureV2CustomerDisplayModeKey =
  | "singlePage"
  | "questionByQuestion";

export const leadCaptureV2CustomerDisplayModeOptions: LeadCaptureV2CustomerDisplayModeKey[] =
  ["singlePage", "questionByQuestion"];

export const leadCaptureV2SetupSteps = [
  {
    id: "welcome" as const,
    step: "01",
    icon: <WavingHandOutlinedIcon fontSize="small" />,
  },
  {
    id: "leadCapture" as const,
    step: "02",
    icon: <AssignmentOutlinedIcon fontSize="small" />,
  },
  {
    id: "serviceTypes" as const,
    step: "03",
    icon: <ChecklistRtlOutlinedIcon fontSize="small" />,
  },
  {
    id: "slotSetup" as const,
    step: "04",
    icon: <CalendarTodayOutlinedIcon fontSize="small" />,
  },
  {
    id: "thankYou" as const,
    step: "05",
    icon: <CelebrationOutlinedIcon fontSize="small" />,
  },
];

export type LeadCaptureV2FieldTypeKey =
  | "shortText"
  | "longText"
  | "email"
  | "phone"
  | "dropdown"
  | "checkbox"
  | "multiSelect"
  | "yesNo"
  | "number"
  | "dimension"
  | "fileUpload"
  | "terms"
  | "esign";

export type LeadCaptureV2FieldLabelGroup = "fields" | "fieldTypes";

export type LeadCaptureV2FieldOption = {
  id: string;
  fieldOptionId?: string;
  label: string;
};

export type LeadCaptureV2PriceMatrixEntry = {
  id: string;
  priceMatrixEntryId?: string;
  fieldOptionId?: string | null;
  value: string;
};

export type LeadCaptureV2PriceMatrix = {
  enabled: boolean;
  entries: LeadCaptureV2PriceMatrixEntry[];
};

export type LeadCaptureV2FormField = {
  id: string;
  formFieldId?: string;
  serviceTypeId?: string | null;
  sourceItemId: string;
  labelKey: string;
  labelGroup: LeadCaptureV2FieldLabelGroup;
  title?: string;
  description?: string;
  unitType?: string | null;
  options?: LeadCaptureV2FieldOption[];
  priceMatrix?: LeadCaptureV2PriceMatrix;
  typeKey: LeadCaptureV2FieldTypeKey;
  required: boolean;
  enabled: boolean;
  verificationRequired?: boolean;
  locked?: boolean;
};

export const leadCaptureV2CustomFieldItems = [
  {
    id: "short-text",
    labelKey: "shortText",
    typeKey: "shortText" as const,
    icon: <ShortTextOutlinedIcon fontSize="small" />,
  },
  {
    id: "long-text",
    labelKey: "longText",
    typeKey: "longText" as const,
    icon: <NotesOutlinedIcon fontSize="small" />,
  },
  {
    id: "email",
    labelKey: "email",
    typeKey: "email" as const,
    icon: <EmailOutlinedIcon fontSize="small" />,
  },
  {
    id: "phone",
    labelKey: "phone",
    typeKey: "phone" as const,
    icon: <LocalPhoneOutlinedIcon fontSize="small" />,
  },
  {
    id: "dropdown",
    labelKey: "dropdown",
    typeKey: "dropdown" as const,
    icon: <RadioButtonCheckedOutlinedIcon fontSize="small" />,
  },
  {
    id: "multi-select",
    labelKey: "multiSelect",
    typeKey: "multiSelect" as const,
    icon: <CheckBoxOutlinedIcon fontSize="small" />,
  },
  {
    id: "yes-no",
    labelKey: "yesNo",
    typeKey: "yesNo" as const,
    icon: <ToggleOnOutlinedIcon fontSize="small" />,
  },
  {
    id: "number",
    labelKey: "number",
    typeKey: "number" as const,
    icon: <NumbersOutlinedIcon fontSize="small" />,
  },
  {
    id: "dimension",
    labelKey: "dimension",
    typeKey: "dimension" as const,
    icon: <StraightenOutlinedIcon fontSize="small" />,
  },
  {
    id: "file-upload",
    labelKey: "fileUpload",
    typeKey: "fileUpload" as const,
    icon: <InsertDriveFileOutlinedIcon fontSize="small" />,
  },
  {
    id: "terms",
    labelKey: "terms",
    typeKey: "terms" as const,
    icon: <VerifiedUserOutlinedIcon fontSize="small" />,
  },
  {
    id: "esign",
    labelKey: "esign",
    typeKey: "esign" as const,
    icon: <SignatureIcon style={{ width: "18px", height: "18px" }} />,
  },
];

export type LeadCaptureV2Service = {
  id: string;
  icon: string;
  leadCaptureV2Id?: string | null;
  name?: string;
  tagline?: string;
  configured: boolean;
  active: boolean;
};
