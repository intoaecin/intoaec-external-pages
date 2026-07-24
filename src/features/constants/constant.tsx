import TextTIcon from "@/assets/icons/TextT-icon";
import AddImageIcon from "@/assets/icons/add-image-icon";
import CheckboxIcon from "@/assets/icons/checkbox-icon";
import DividerIcon from "@/assets/icons/divider-icon";
import { NoteLinesIcon } from "@/assets/icons/note-icon";
import PricingTableIcon from "@/assets/icons/pricingTable-icon";
// import DrawIcon from "@mui/icons-material/Draw";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ProjectEye from "@/assets/icons/project-eye";
import StarIcon1 from "@/assets/icons/star-icon1";
import StarIcon2 from "@/assets/icons/star-icon2";
import StarIcon3 from "@/assets/icons/star-icon3";
import StarIcon4 from "@/assets/icons/star-icon4";
import StarIcon5 from "@/assets/icons/star-icon5";
import SuccessTick from "@/assets/icons/success-tick";
import TableIcon from "@/assets/icons/table-icon";
import UsersInfo from "@/assets/icons/users-info";
import { ControlComponents } from "@/types";
import { v4 as uuid } from "uuid";
import SignatureIcon from "@/assets/icons/signature-icon";
import { Shapes } from "lucide-react";
export const filterData = [
  {
    project: "3D REndering",
    stage: "New",
    source: "Advertisement",
    assigned: "all",
  },
  {
    project: "Architecture",
    stage: "Followed up",
    source: "referals",
    assigned: "today",
  },
  {
    project: "Vendor",
    stage: "Connected",
    source: "community sites",
    assigned: "yesterday",
  },
  {
    project: "Manufacturer",
    stage: "Meeting scheduled",
    source: "digital ads",
    assigned: "this_month",
  },
];

export const ProjectTypes = [
  "3D Rendering",
  "Architecture",
  "Architectural Designing ",
  "Architectural Drawing ",
  "Attic Conversion ",
  "Residential Projects",
  "Commercial Projects",
  "Industrial Projects",
  "Institutional Projects",
  "Recreational Projects",
];

export const LeadStages = [
  "New",
  "Connected",
  "Followed up",
  "Meeting scheduled",
  "Estimate sent",
];
export const LeadSources = [
  "Advertisement",
  "Client Referrals",
  "Community Sites",
  "Email ",
  "SEO",
  "Digital marketing ",
  "Digital Ads",
  "Social Media",
];

export const dropdownOptions = [
  {
    value: "New",
    label: "New",
    color: "#00ADD3",
  },
  {
    value: "Connected",
    label: "Connected",
    color: "#FFB946",
  },
  {
    value: "Followed-Up",
    label: "Followed-Up",
    color: "#3CA2FF",
  },
  {
    value: "Scheduled Meeting",
    label: "Scheduled Meeting",
    color: "#885AF8",
  },
  {
    value: "Estimate Sent",
    label: "Estimate Sent",
    color: "#2ECAD4",
  },
];

export const AvatarArr = [
  {
    name: "John Doe",
    avatarUrl: "https://mui.com/static/images/avatar/1.jpg",
  },
  {
    name: "Jane Smith",
    avatarUrl: "https://mui.com/static/images/avatar/2.jpg",
  },
  {
    name: "Heisenburg",
    avatarUrl: "https://mui.com/static/images/avatar/3.jpg",
  },
  {
    name: "Bob Carl",
    avatarUrl: "https://mui.com/static/images/avatar/4.jpg",
  },
];
export const priorities = [
  {
    name: "High",
    role: "High",
    avatarUrl: "/images/high-icon.svg",
  },
  {
    name: "Medium",
    role: "Medium",
    avatarUrl: "/images/medium-icon.svg",
  },
  {
    name: "Low",
    role: "Low",
    avatarUrl: "/images/low-icon.svg",
  },
];

export const organiationTypes = [
  "Architect",
  "Vendor",
  "Manufacturer",
  "Distributer",
  "Service provider",
  "Retailer",
];

export const proposalControllers = {
  Editors: [
    {
      controllerName: "TEXT",
      icon: <TextTIcon style={{ width: "25px", height: "25px" }} />,
      style: { width: 200 },
      x: 0,
      y: 0,
    },
    {
      controllerName: "IMAGE",
      icon: <AddImageIcon style={{ width: "25px", height: "25px" }} />,
      style: { width: 220, height: 75 },
      x: 0,
      y: 10,
      value: "",
    },
    {
      controllerName: "TABLE",
      icon: (
        <TableIcon
          style={{
            width: "25px",
            height: "25px",
            stroke: "#fff",
            strokeWidth: "0.3px",
          }}
        />
      ),
      style: {
        width: 781,
        height: 250,
      },
      content: [
        [
          {
            value: "",
            style: {
              width: 190,
              height: 60,
              backgroundColor: "#d1d5db",
            },
            cellId: uuid(),
            isHeader: true,
          },
          {
            value: "",
            style: {
              width: 190,
              height: 60,
              backgroundColor: "#d1d5db",
            },
            cellId: uuid(),
            isHeader: true,
          },
          {
            value: "",
            style: {
              width: 190,
              height: 60,
              backgroundColor: "#d1d5db",
            },
            cellId: uuid(),
            isHeader: true,
          },
          // {
          //   value: "",
          //   style: {
          //     width: 190,
          //     height: 60,
          //     backgroundColor: "#d1d5db",
          //   },
          //   cellId: uuid(),
          //   isHeader: true,
          // },
        ],
        [
          {
            value: "",
            style: {
              width: 60,
              height: 60,
            },
            cellId: uuid(),
          },
          {
            value: "",
            style: {
              width: 60,
              height: 60,
            },
            cellId: uuid(),
          },
          {
            value: "",
            style: {
              width: 60,
              height: 60,
            },
            cellId: uuid(),
          },
          // {
          //   value: "",
          //   style: {
          //     width: 60,
          //     height: 60,
          //   },
          //   cellId: uuid(),
          // },
        ],
        [
          {
            value: "",
            style: {
              width: 60,
              height: 60,
            },
            cellId: uuid(),
          },
          {
            value: "",
            style: {
              width: 60,
              height: 60,
            },
            cellId: uuid(),
          },
          {
            value: "",
            style: {
              width: 60,
              height: 60,
            },
            cellId: uuid(),
          },
          // {
          //   value: "",
          //   style: {
          //     width: 60,
          //     height: 60,
          //   },
          //   cellId: uuid(),
          // },
        ],
        // [
        //   {
        //     value: "",
        //     style: {
        //       width: 60,
        //       height: 60,
        //     },
        //     cellId: uuid(),
        //   },
        //   {
        //     value: "",
        //     style: {
        //       width: 60,
        //       height: 60,
        //     },
        //     cellId: uuid(),
        //   },
        //   {
        //     value: "",
        //     style: {
        //       width: 60,
        //       height: 60,
        //     },
        //     cellId: uuid(),
        //   },
        //   {
        //     value: "",
        //     style: {
        //       width: 60,
        //       height: 60,
        //     },
        //     cellId: uuid(),
        //   },
        // ],
      ],
      x: 0,
      y: 10,
    },
    {
      controllerName: "DIVIDER",
      icon: <DividerIcon style={{ width: "25px", height: "25px" }} />,
      style: {},
      x: 0,
      y: 10,
    },
    {
      controllerName: "CHECKBOX",
      icon: <CheckboxIcon style={{ width: "18px", height: "18px" }} />,
      style: { width: 300 },
      x: 0,
      y: 10,
    },
    {
      controllerName: "SIGNATURE",
      // icon: <DrawIcon style={{ width: "18px", height: "18px" }} />,
      icon: <SignatureIcon style={{ width: "18px", height: "18px" }} />,
      style: {},
      x: 0,
      y: 10,
    },
    {
      controllerName: "SHAPE",
      // icon: <DrawIcon style={{ width: "18px", height: "18px" }} />,
      icon: <Shapes style={{ width: "18px", height: "18px" }} />,
      style: { width: 200, height: 200 },
      x: 0,
      y: 10,
      value: { shape: "square", isLocked: false },
    },
  ],
  // AI: [
  //   {
  //     controllerName: "AI_GENERATOR",
  //     icon: <AutoAwesomeIcon style={{ width: "25px", height: "25px" }} />,
  //     style: {},
  //     x: 0,
  //     y: 0,
  //   },

  // ],

  Pricing_Table: [
    {
      controllerName: "PRICING_TABLE",
      icon: (
        <PricingTableIcon
          style={{
            width: "30px",
            height: "30px",
            stroke: "#fff",
            strokeWidth: "0.3px",
          }}
        />
      ),
      content: [
        [
          { value: "", style: { width: 60, height: 60 } },
          { value: "", style: { width: 60, height: 60 } },
          { value: "", style: { width: 60, height: 60 } },
        ],
      ],
      header: [
        { value: "Name", label: "Name" },
        { value: "Price", label: "Price" },
        { value: "Quantity", label: "Quantity" },
        { value: "Subtotal", label: "Subtotal" },
      ],
      style: { width: 400 },
      x: 0,
      y: 0,
    },
  ],
  MY_Organization: [
    {
      controllerName: "TERMS_AND_CONDITIONS",
      icon: (
        <NoteLinesIcon
          style={{ width: "20px", height: "20px", strokeWidth: "0.3px" }}
        />
      ),
      style: {},
      x: 0,
      y: 0,
    },
    {
      controllerName: "ORGANIZATION_LOGO",
      icon: <AddImageIcon style={{ width: "25px", height: "25px" }} />,
      style: { width: 220, height: 75 },
      x: 0,
      y: 10,
      value: "",
    },
  ],
  // IMPORT_PDF: [
  //   {
  //     controllerName: "IMPORT_PDF",
  //     pageData:{},
  //   },
  // ],
};
export const proposalMacros = {
  MyProfile: [
    {
      macroName: ["User name", "User email", "User phone", "User phone"],
    },
  ],

  Lead_Management: [
    {
      macroName: ["User name", "User email", "User phone", "User phone"],
    },
  ],
  Userhub: [
    {
      macroName: ["User name", "User email", "User phone", "User phone"],
    },
  ],
};
export const steps = [
  {
    label: "Lead",
    icon: <UsersInfo style={{ width: "30px", height: "30px" }} />,
  },
  {
    label: "Project",
    icon: <ProjectEye style={{ width: "30px", height: "30px" }} />,
  },
  {
    label: "Success",
    icon: <SuccessTick style={{ width: "30px", height: "30px" }} />,
  },
];
export const language = [
  "English",
  "Mandarin Chinese",
  "Hindi",
  "Spanish",
  "French",
  "Standard Arabic",
  "Bengali",
  "Russian",
  "Portuguese",
  "Urdu",
  "Indonesian",
  "German",
  "Japanese",
  "Swahili",
  "Marathi",
  "Telugu",
  "Turkish",
  "Tamil",
  "Western Punjabi",
  "Wu Chinese",
  "Korean",
  "Vietnamese",
  "Hausa",
  "Javanese",
  "Egyptian Arabic",
  "Italian",
  "Filipino",
  "Yue Chinese",
  "Thai",
  "Burmese",
  "Kannada",
  "Gujarati",
  "Sunda",
  "Polish",
  "Bhojpuri",
  "Ukrainian",
  "Southern Min",
  "Northern Uzbek",
  "Xiang Chinese",
  "Malayalam",
  "Hakka Chinese",
  "Odia",
  "Maithili",
  "Eastern Punjabi",
  "Saraiki",
  "Nepali",
  "Sinhala",
  "Chittagonian",
  "Amharic",
  "Somali",
  "Malay",
  "Azerbaijani",
  "Cebuano",
  "Nigerian Fulfulde",
  "Kurdish",
  "Sanaani Spoken Arabic",
  "Yoruba",
  "Igbo",
  "Sindhi",
  "Taʽizzi-Adeni Arabic",
  "Romanian",
  "Tagalog",
  "Dutch",
  "Gan Chinese",
  "Serbo-Croatian",
  "Oromo",
  "Thai Sign Language",
  "Yiddish",
  "Northern Pashto",
  "Malagasy",
  "Sylheti",
  "Sinhalese Sign Language",
  "Deccan",
  "Rangpuri",
  "Uyghur",
  "Hungarian",
  "Chhattisgarhi",
  "Greek",
  "Marwari",
  "Eastern Min",
  "Slovak",
  "Kazakh",
  "Belarusian",
  "Somali Bantu",
  "Northeastern Thai",
  "Uyghur Arabic",
  "Croatian",
  "Zhuang",
  "Kinyarwanda",
  "Akan",
  "Khmer",
  "Magahi",
  "Haryanvi",
  "Czech",
  "Nyanja",
  "Zulu",
  "Kinyarwanda",
  "Algerian Arabic",
  "Fula",
  "Azerbaijani",
  "Ilocano",
];

export const ArchitectSkills = [
  { skill: "Architectural Design" },
  { skill: "Interior Design" },
  { skill: "Space Planning" },
  { skill: "2D Design" },
  { skill: "3D Modeling" },
  { skill: "Building Information Modeling (BIM)" },
  { skill: "AutoCAD" },
  { skill: "SketchUp" },
  { skill: "Revit" },
  { skill: "Floor Plans" },
  { skill: "Elevations" },
  { skill: "Sections" },
  { skill: "Site Analysis" },
  { skill: "Conceptualization" },
  { skill: "Design Development" },
  { skill: "Detailing" },
  { skill: "Model Making" },
  { skill: "Rendering" },
  { skill: "Visualization" },
  { skill: "Perspective Drawing" },
  { skill: "Color Theory" },
  { skill: "Materials Selection" },
  { skill: "Furniture Design" },
  { skill: "Lighting Design" },
  { skill: "Acoustics" },
  { skill: "Sustainable Design" },
  { skill: "Environmental Design" },
  { skill: "Urban Planning" },
  { skill: "Landscape Design" },
  { skill: "Construction Documents" },
  { skill: "Building Codes" },
  { skill: "Zoning Regulations" },
  { skill: "Architectural Drafting" },
  { skill: "Specifications Writing" },
  { skill: "Technical Drawing" },
  { skill: "Structural Analysis" },
  { skill: "Mechanical Systems Integration" },
  { skill: "Electrical Systems Integration" },
  { skill: "Plumbing Systems Integration" },
  { skill: "HVAC Systems Integration" },
  { skill: "Cost Estimation" },
  { skill: "Budget Management" },
  { skill: "Project Management" },
  { skill: "Construction Administration" },
  { skill: "Quality Control" },
  { skill: "Site Supervision" },
  { skill: "Building Inspection" },
  { skill: "Building Systems Coordination" },
  { skill: "Adaptive Reuse" },
  { skill: "Historic Preservation" },
  { skill: "Feasibility Studies" },
  { skill: "Programming" },
  { skill: "Client Relations" },
  { skill: "Communication Skills" },
  { skill: "Presentation Skills" },
  { skill: "Team Collaboration" },
  { skill: "Leadership" },
  { skill: "Critical Thinking" },
  { skill: "Problem-Solving" },
  { skill: "Decision-Making" },
  { skill: "Time Management" },
  { skill: "Attention to Detail" },
  { skill: "Spatial Awareness" },
  { skill: "Ergonomics" },
  { skill: "Building Envelope Design" },
  { skill: "Façade Design" },
  { skill: "Façade Systems Integration" },
  { skill: "Fire Safety Design" },
  { skill: "Emergency Evacuation Planning" },
  { skill: "Universal Design" },
  { skill: "Accessible Design" },
  { skill: "Research Skills" },
  { skill: "Market Analysis" },
  { skill: "Cultural Sensitivity" },
  { skill: "Trend Analysis" },
  { skill: "Model Photography" },
  { skill: "Computer-Aided Design (CAD)" },
  { skill: "3D Printing" },
  { skill: "Virtual Reality (VR) Design" },
  { skill: "Augmented Reality (AR) Design" },
  { skill: "Software Proficiency" },
  { skill: "Adobe Creative Suite" },
  { skill: "Microsoft Office Suite" },
  { skill: "Digital Fabrication" },
  { skill: "Detail Drawing" },
  { skill: "Cost-Benefit Analysis" },
  { skill: "Collaboration with Engineers" },
  { skill: "Collaboration with Interior Designers" },
  { skill: "Collaboration with Landscape Architects" },
  { skill: "Code Compliance" },
  { skill: "Regulatory Compliance" },
  { skill: "Risk Management" },
  { skill: "Crisis Management" },
  { skill: "Marketing" },
  { skill: "Networking" },
  { skill: "Negotiation Skills" },
  { skill: "Vendor Management" },
  { skill: "Time and Motion Studies" },
  { skill: "Client Education" },
  { skill: "Continuous Learning" },
];

export const productTags = ["Wood work", "second check"];
export enum NotificationTemplateNames {
  QUESTIONNAIRE_SENT = "QUESTIONNAIRE_SENT",
  ESTIMATE_SENT = "ESTIMATE_SENT",
  ESTIMATE_SENT_REMINDER = "ESTIMATE_SENT_REMINDER",
  INVOICE_SENT = "INVOICE_SENT",
  INVOICE_EDIT = "INVOICE_EDITED",
  INVOICE_REQUEST_PAYMENT = "INVOICE_REQUEST_PAYMENT",
  PROPOSAL_SENT = "PROPOSAL_SENT",
  SEND_AVAILABILITY = "SEND_AVAILABILITY",
  QUESTIONNAIRE_RESENT = "QUESTIONNAIRE_RESENT",
  ESTIMATE_RESQUEST_APPROVAL = "ESTIMATE_REQUEST_APPROVAL",
}

// State to manage the controls

export const controlComponents: ControlComponents = {
  Checkbox: {
    controlerName: "CHECK_BOX",
    label: ["Check box"],
    question: "",
    options: [{ value: "" }],
    isOtherEnabled: false,
    isRequired: false,
  },
  Radio: {
    controlerName: "RADIO_BUTTON",
    label: ["Radio button"],
    question: "",
    isOtherEnabled: false,
    options: [{ value: "" }],
    isRequired: false,
  },
  TextShort: {
    controlerName: "SHORT_ANSWER",
    label: ["Short answer"],
    question: "",
    isRequired: false,
    isOtherEnabled: false,
  },
  TextLong: {
    controlerName: "LONG_ANSWER",
    label: ["Long answer"],
    question: "",
    isRequired: false,
    isOtherEnabled: false,
  },
  DropdownSingle: {
    controlerName: "DROPDOWN_SINGLE",
    label: ["Dropdown (Single)"],
    question: "",
    options: [{ value: "" }],
    isOtherEnabled: false,
    isRequired: false,
  },
  DropdownMulti: {
    controlerName: "DROPDOWN_MULTI",
    label: ["Dropdown (Multiple)"],
    question: "",
    options: [{ value: "" }],
    isOtherEnabled: false,
    isRequired: false,
  },
  Email: {
    controlerName: "EMAIL",
    label: ["Email"],
    question: "",
    isOtherEnabled: false,
    isRequired: false,
  },
  SliderScale: {
    controlerName: "SLIDER_SCALE",
    label: "Slider Scale",
    isRequired: false,
    question: "",
    options: {
      isNumericFormat: false,
      startValue: 0,
      endValue: 100,
      initialPosition: 0,
      stepValue: 1,
      leftLabel: "",
      middleLabel: "",
      rightLabel: "",
    },
    value: undefined,
  },
  Form: {
    controlerName: "FORM",
    label: ["Form"],
    question: "",
    formControls: [
      {
        label: "First Name",
        isRequired: false,
        controlerName: "SHORT_ANSWER",
        isForm: true,
        isEnabled: false,
      },
      {
        label: "Last Name",
        isRequired: false,
        controlerName: "SHORT_ANSWER",
        isForm: true,
        isEnabled: false,
      },
      {
        label: "Email",
        isRequired: false,
        controlerName: "SHORT_ANSWER",
        isForm: true,
        isEnabled: true,
      },
      {
        label: "Phone",
        isRequired: false,
        controlerName: "SHORT_ANSWER",
        isForm: true,
        isEnabled: true,
      },
      {
        label: "Company",
        isRequired: false,
        controlerName: "SHORT_ANSWER",
        isForm: true,
        isEnabled: true,
      },
      {
        label: "Address1",
        isRequired: false,
        controlerName: "SHORT_ANSWER",
        isForm: true,
        isEnabled: true,
      },
      {
        label: "Address2",
        isRequired: false,
        controlerName: "SHORT_ANSWER",
        isForm: true,
        isEnabled: true,
      },
      {
        label: "City",
        isRequired: false,
        controlerName: "SHORT_ANSWER",
        isForm: true,
        isEnabled: true,
      },
      {
        label: "State",
        isRequired: false,
        controlerName: "SHORT_ANSWER",
        isForm: true,
        isEnabled: true,
      },
      {
        label: "Zip Code",
        isRequired: false,
        controlerName: "SHORT_ANSWER",
        isForm: true,
        isEnabled: true,
      },
      {
        label: "Country",
        isRequired: false,
        controlerName: "SHORT_ANSWER",
        isForm: true,
        isEnabled: true,
      },
    ],

    isOtherEnabled: false,
    isRequired: false,
  },
  PhoneNumber: {
    controlerName: "PHONE_NUMBER",
    label: ["Phone Number"],
    question: "",
    isOtherEnabled: false,
    isRequired: false,
  },
  DateAndTime: {
    controlerName: "DATE_AND_TIME",
    label: ["Date & Time"],
    question: "",
    options: {
      isTimeEnable: false,
      format: "",
      dateRange: "",
      end: "",
    },
  },
  RatingScale: {
    controlerName: "RATING_SCALE",
    label: ["Rating Scale"],
    question: "",
    options: {
      reperesentationType: "Number",
      displayFormat: "Vertical",
      choices: [
        {
          ratingValue: "",
          ratingLabel: "",
          imgValue: "",
        },
      ],
    },
  },
  MatrixRatingScale: {
    controlerName: "MATRIX_RATING_SCALE",
    label: ["Matrix Rating Scale"],
    question: "",
    options: {
      reperesentationType: "Number",
      rowLabel: [{ value: "" }],
      columnLabel: [
        {
          ratingValue: "",
          ratingLabel: "",
          imgValue: "",
        },
      ],
    },
  },
  MatrixChoiceSingle: {
    isRequired: false,
    question: "",
    label: ["Matrix Choice Single"],
    controlerName: "MATRIX_CHOICE_SINGLE",
    isOtherEnabled: false,
    options: {
      rowLabel: [{ value: "" }],
      columnLabel: [{ value: "" }],
    },
  },
  MatrixChoiceMulti: {
    isRequired: false,
    question: "",
    label: ["Matrix Choice Multi"],
    controlerName: "MATRIX_CHOICE_MULTI",
    isOtherEnabled: false,
    options: {
      rowLabel: [{ value: "" }],
      columnLabel: [{ value: "" }],
    },
  },
  MatrixDropdown: {
    isRequired: false,
    question: "",
    label: ["Matrix Dropdown"],
    controlerName: "MATRIX_DROPDOWN",
    options: {
      rowLabel: [{ value: "" }],
      columnLabel: [{ value: "", options: [{ value: "" }] }],
    },
  },
  AddImage: {
    isRequired: false,
    question: "",
    label: ["Add Image"],
    controlerName: "ADD_IMAGE",
    isOtherEnabled: false,
    selectionValue: "single_selection",
    options: [],
  },
  FileUpload: {
    isRequired: false,
    question: "",
    label: ["File Upload"],
    controlerName: "FILE_UPLOAD",
    options: [{ acceptedType: "All", description: "" }],
  },
};

export const fileuploadDropdownOptions = [
  {
    name: "All",
    value:
      "txt,rft,doc,docx,xls,xlsx,csv,ppt,pptx,pdf,jpg,jpeg,png,gif,zip,rar",
  },
  { name: "Text Document (txt,rft,doc,docx)", value: "txt,rft,doc,docx" },
  { name: "Spreadsheets (xls,xlsx,csv)", value: "xls,xlsx,csv" },
  { name: "Presentations (ppt,pptx,pdf)", value: "ppt,pptx,pdf" },
  { name: "Images (jpg,jpeg,png,gif)", value: "jpg,jpeg,png,gif" },
  { name: "Compressed (zip,rar)", value: "zip,rar" },
];

export const smileysDropDown = [
  { name: "&#128532;", value: 128532 },
  { name: "&#128543;", value: 128543 },
  { name: "&#128528;", value: 128528 },
  { name: "&#128578;", value: 128578 },
  { name: "&#128522;", value: 128522 },
];

export const starDropDown = [
  { name: "starIcon1", value: "starIcon1" },
  { name: "starIcon2", value: "starIcon2" },
  { name: "starIcon3", value: "starIcon3" },
  { name: "starIcon4", value: "starIcon4" },
  { name: "starIcon5", value: "starIcon5" },
];

export const RenderStar = (name: any) => {
  switch (name) {
    case "starIcon1":
      return (
        <StarIcon1 style={{ width: "30px", height: "30px", fill: "#C2CFE0" }} />
      );
    case "starIcon2":
      return (
        <StarIcon2 style={{ width: "30px", height: "30px", fill: "#C2CFE0" }} />
      );
    case "starIcon3":
      return (
        <StarIcon3 style={{ width: "30px", height: "30px", fill: "#C2CFE0" }} />
      );
    case "starIcon4":
      return (
        <StarIcon4 style={{ width: "30px", height: "30px", fill: "#C2CFE0" }} />
      );
    case "starIcon5":
      return (
        <StarIcon5 style={{ width: "30px", height: "30px", fill: "#C2CFE0" }} />
      );
    default:
      return null;
  }
};

export const dashboardDropdown = [
  {
    text: "common.all",
    value: "ALL",
  },
  {
    text: "common.today",
    value: "TODAY",
  },
  {
    text: "common.thisweek",
    value: "THIS_WEEK",
  },
  {
    text: "common.thismonth",
    value: "THIS_MONTH",
  },
];

export enum PushNotificationModule {
  INVENTORY_MANAGEMENT = "INVENTORY_MANAGEMENT",
  LEAD_MANAGER = "LEAD_MANAGER",
  USER_HUB = "USER_HUB",
  TEMPLATE_CENTER = "TEMPLATE_CENTER",
  LOCALIZATION = "LOCALIZATION",
  AUTOMATION = "AUTOMATION",
  PREFERENCES = "PREFERENCES",
  LEAD = "LEAD",
  INTEGRATIONS = "INTEGRATIONS",
  MY_ORGANIZATION = "MY_ORGANIZATION",
  CLIENT_PROFILE = "CLIENT_PROFILE",
}

export enum PushNotificationSubModule {
  INVENTORY_ITEMS = "INVENTORY_ITEMS",
  INVENTORY_GROUP = "INVENTORY_GROUP",
  DISCOUNT = "DISCOUNTS",
  QUESTIONNAIRE = "QUESTIONNAIRE",
  PROPOSAL = "PROPOSAL",
  TERMS_AND_CONDITION = "TERMS_AND_CONDITION",
  TAXES = "TAXES",
  MY_Organization = "MY_ORGANIZATION",
  LEAD = "LEAD",
  ADMIN = "ADMIN",
  WEBSITE = "WEBSITE",
  LEAD_MASTER = "LEAD_MASTER",
  LEAD_PROFILE = "LEAD_PROFILE",
  NOTIFICATION_TEMPLATE = "NOTIFICATION_TEMPLATE",
  OPEN_AI = "OPEN_AI",
  GOOGLE = "GOOGLE",
  TASK_MANAGEMENT = "TASK_MANAGEMENT",
  PROFESSIONAL_SUMMARY = "PROFESSIONAL_SUMMARY",
  AREA_OF_EXPERTISE = "AREA_OF_EXPERTISE",
  AWARDS = "AWARDS",
  CERTIFICATE = "CERTIFICATE",
  PUBLICATION = "PUBLICATION",
  TIME_ZONE_AND_CURRENCY = "TIME_ZONE_AND_CURRENCY",
  PRESENTATION = "PRESENTATION",
  PORTFOLIO = "PORTFOLIO",
  SOCIAL_MEDIA = "SOCIAL_MEDIA",
  ESIGN = "ESIGN",
  LOGO = "LOGO",
  EMAIL_SENT = "EMAIL_SENT",
  ESTIMATE = "ESTIMATE",
  PROJECT_SCHEDULE = "SCHEDULE",
  SELECTION = "SELECTION",
  SELECTION_ITEM = "SELECTION_ITEM",
  SCHEDULE_MANAGEMENT = "SCHEDULE_MANAGEMENT",
  WORKER_MANAGEMENT = "WORKER_MANAGEMENT",
}

export enum PushNotificationType {
  INVENTORY_MANAGEMENT = "INVENTORY_MANAGEMENT",
  SENT = "SENT",
  SENT_WITH_EXPIRY = "SENT_WITH_EXPIRY",
  SENT_WITHOUT_EXPIRY = "SENT_WITHOUT_EXPIRY",
  RESENT_WITH_EXPIRY = "RESENT_WITH_EXPIRY",
  RESENT_WITHOUT_EXPIRY = "RESENT_WITHOUT_EXPIRY",
  RESENT = "RESENT",
  AVAILABILITY_SENT = "AVAILABILITY_SENT",
  SETTING_UDPATED = "SETTING_UDPATED",
  EXPERTIES_ADDED = "EXPERTIES_ADDED",
  PROFESSIONAL_DETAILS_UPDATED = "PROFESSIONAL_DETAILS_UPDATED",
  PORTFOLIO_CREATED_WITH_VISBILITY = "PORTFOLIO_CREATED_WITH_VISBILITY",
  PORTFOLIO_CREATED_WITHoUT_VISBILITY = "PORTFOLIO_CREATED_WITHoUT_VISBILITY",
  AWARD_ADDED = "AWARD_ADDED",
  AWARD_EDITED = "AWARD_EDITED",
  AWARD_DELETED = "AWARD_DELETED",
  PROPOSAL_OPENED = "PROPOSAL_OPENED",
  PROPOSAL_VIEWED = "PROPOSAL_VIEWED",
  EXPORTED = "EXPORTED",
  QUESTIONNIARE_VIEWED = "QUESTIONNIARE_VIEWED",
  QUESTIONNIARE_OPENED = "QUESTIONNIARE_OPENED",
  EMAIL_OPENEND = "EMAIL_OPENEND",
  EMAIL_BOUNCED = "EMAIL_BOUNCED",
  EMAIL_DELIVERED = "EMAIL_DELIVERED",
  EMAIL_DEFERRED = "EMAIL_DEFERRED",
  ASSIGNEE_TRANSFERED = "ASSIGNEE_TRANSFERED",
  // LEAD_CREATED_WITH_ASSIGNE = "LEAD_CREATED_WITH_ASSIGNE",
  // LEAD_CREATED_WITHOUT_ASSIGNE = "LEAD_CREATED_WITHOUT_ASSIGNE",
  OPENAI_CONFIGURED = "OPENAI_CONFIGURED",
  OPENAI_DEACTIVATED = "OPENAI_DEACTIVATED",
  MEETING_LIMIT_UPDATED = "MEETING_LIMIT_UPDATED",
  GOOGLE_CALENDAR_CONFIGURED = "GOOGLE_CALENDAR_CONFIGURED",
  GOOGLE_CALENDAR_SWITCHED = "GOOGLE_CALENDAR_SWITCHED",
  GOOGLE_CALENDAR_DEACTIVATED = "GOOGLE_CALENDAR_DEACTIVATED",
  DOWNLOADED = "DOWNLOADED",
  SLOT_AVAILABILITY_ADDED = "SLOT_AVAILABILITY_ADDED",
  SLOT_AVAILABILITY_UPDATED = "SLOT_AVAILABILITY_UPDATED",
  SLOT_AVAILABILITY_REMOVED = "SLOT_AVAILABILITY_REMOVED",
  AVAILABILITY_UPDATED = "AVAILABILITY_UPDATED",
  MARKED_AS_UNAVILABLE = "MARKED_AS_UNAVILABLE",
  FILE_DELETED = "FILE_DELETED",
  FOLDER_DELETED = "FOLDER_DELETED",
  FILE_TRASHED = "FILE_TRASHED",
  FILE_RESTORED = "FILE_RESTORED",
  FOLDER_TRASHED = "FOLDER_TRASHED",
  FOLDER_RESTORED = "FOLDER_RESTORED",
  VISIBILITY_ENABLED = "VISIBILITY_ENABLED",
  VISIBILITY_DISABLED = "VISIBILITY_DISABLED",
  FILE_UPDATED = "FILE_UPDATED",
  FOLDER_UPDATED = "FOLDER_UPDATED",
  // FILE_UPLOADED = "FILE_UPLOADED",
  FILE_UPDATED_WITH_VISIBILITY = "FILE_UPDATED_WITH_VISIBILITY",
  FILE_UPDATED_WITHOUT_VISIBILITY = "FILE_UPDATED_WITHOUT_VISIBILITY",
  FOLDER_UPDATED_WITHOUT_VISIBILITY = "FOLDER_UPDATED_WITHOUT_VISIBILITY",
  FOLDER_UPDATED_WITH_VISIBILITY = "FOLDER_UPDATED_WITH_VISIBILITY",
  FILES_MOVED = "FILES_MOVED",
  FILE_CREATED_WITH_VISIBILITY = "FILE_CREATED_WITH_VISIBILITY",
  FILE_CREATED_WITHOUT_VISIBILITY = "FILE_CREATED_WITHOUT_VISIBILITY",

  FOLDER_CREATED_WITH_VISIBIITY = "FOLDER_CREATED_WITH_VISIBIITY",
  FOLDER_CREATED_WITHOUT_VISIBIITY = "FOLDER_CREATED_WITHOUT_VISIBIITY",

  AUTOMATION_CREATED = "AUTOMATION_CREATED",
  AUTOMATION_EDITED = "AUTOMATION_EDITED",
  AUTOMATION_INACTIVATED = "AUTOMATION_INACTIVATED",
  AUTOMATION_REACTIVATED = "AUTOMATION_REACTIVATED",
  AUTOMATION_DELETED = "AUTOMATION_DELETED",
  UPDATED_SHOW = "UPDATED_SHOW",
  UPDATED_HIDDEN = "UPDATED_HIDDEN",
  TAndC_ENABLE_VISIBILITY = "TAndC_ENABLE_VISIBILITY",
  TAndC_DISABLE_VISIBILITY = "TAndC_DISABLE_VISIBILITY",
  TAndC_CATEGORY_UPDATED = "TAndC_CATEGORY_UPDATED",
  TAndC_UPDATED = "TAndC_UPDATED",
  REACTIVATION = "REACTIVATION",
  EDITED = "EDITED",
  DELETED = "DELETED",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
  INACTIVATED = "INACTIVATED",
  CREATED = "CREATED",
  LEAD_CREATED = "LEAD_CREATED",
  LEAD_CREATED_WITH_ASSIGNEE = "LEAD_CREATED_WITH_ASSIGNEE",
  EXISTING_LEAD_CREATED_WITH_ASSIGNEE = "EXISTING_LEAD_CREATED_WITH_ASSIGNEE",
  EXISTING_LEAD_CREATED_WITHOUT_ASSIGNEE = "EXISTING_LEAD_CREATED_WITHOUT_ASSIGNEE",
  LEAD_CREATED_WITHOUT_ASSIGNEE = "LEAD_CREATED_WITHOUT_ASSIGNEE",
  LEAD_CREATED_WITH_MEETING_SCHEDULE = "LEAD_CREATED_WITH_MEETING_SCHEDULE",
  LEAD_CREATED_WITHOUT_MEETING_SCHEDULE = "LEAD_CREATED_WITHOUT_MEETING_SCHEDULE",
  CREATED_ONLINE_MEETING = "CREATED_ONLINE_MEETING",
  CREATED_OFFLINE_MEETING = "CREATED_OFFLINE_MEETING",
  UPDATED_ONLINE_MEETING = "UPDATED_ONLINE_MEETING",
  CALL_LOG_CREATED = "CALL_LOG_CREATED",
  CALL_LOG_UPDATED = "CALL_LOG_UPDATED",
  CALL_LOG_DELETED = "CALL_LOG_DELETED",
  CALL_LOG_BULK_DELETE = "CALL_LOG_BULK_DELETE",
  CREATED_NOTES = "CREATED_NOTES",
  UPDATED_NOTES = "UPDATED_NOTES",
  DELETED_NOTES = "DELETED_NOTES",
  UPDATED_OFFLINE_MEETING = "UPDATED_OFFLINE_MEETING",
  DELETED_OFFLINE_MEETING = "DELETED_OFFLINE_MEETING",
  DELETED_ONLINE_MEETING = "DELETED_ONLINE_MEETING",
  LEAD_UPLOADED = "LEAD_UPLOADED",
  LEAD_SNOOZED = "LEAD_SNOOZED",
  BULK_SNOOZE = "BULK_SNOOZE",
  LEAD_ARCHIVED = "LEAD_ARCHIVED",
  LEAD_ACTIVE = "LEAD_ACTIVE",
  LEAD_RESTORATION = "LEAD_RESTORATION",
  BULK_ARCHIVE = "BULK_ARCHIVE",
  BULK_RESTORATION = "BULK_RESTORATION",
  BULK_ACTIVATION = "BULK_ACTIVATION",
  LEAD_STAGE_UPDATED = "LEAD_STAGE_UPDATED",
  LEAD_WON = "LEAD_WON",
  LEAD_LOST = "LEAD_LOST",
  BULK_WON = "BULK_WON",
  BULK_LOST = "BULK_LOST",
  BULK_STAGE_UPDATED = "BULK_STAGE_UPDATED",
  DUPLICATE = "DUPLICATE",
  ANSWER_BY_OWN = "ANSWER_BY_OWN",
  EDITED_ANSWER_BY_OWN = "EDITED_ANSWER_BY_OWN",
  TRASH = "TRASH",
  RESTORE = "RESTORE",
  SUBMITTED = "SUBMITTED",
  UPDATED = "UPDATED",
  UPDATED_PROJECT = "UPDATED_PROJECT",
  UPDATED_PROFILE = "UPDATED_PROFILE",
  UPDATED_QUESTIONNAIRE_HIDE = "UPDATED_QUESTIONNAIRE_HIDE",
  UPDATED_QUESTIONNAIRE_SHOW = "UPDATED_QUESTIONNAIRE_SHOW",
  PROPOSAL_SUGGESTION_RECEIVED = "PROPOSAL_SUGGESTION_RECEIVED",
  GLOBAL_THEME = "GLOBAL_THEME",
  WEBSITE_ADDED = "WEBSITE_ADDED",

  QUESTIONNAIRE_AUTO_EXPIRY_ENABLED = "QUESTIONNAIRE_AUTO_EXPIRY_ENABLED",
  PROPOSAL_AUTO_EXPIRY_ENABLED = "PROPOSAL_AUTO_EXPIRY_ENABLED",
  QUESTIONNAIRE_AUTO_EXPIRY_UPDATED = "QUESTIONNAIRE_AUTO_EXPIRY_UPDATED",
  PROPOSAL_AUTO_EXPIRY_UPDATED = "PROPOSAL_AUTO_EXPIRY_UPDATED",
  QUESTIONNAIRE_AUTO_EXPIRY_DISABLED = "QUESTIONNAIRE_AUTO_EXPIRY_DISABLED",
  PROPOSAL_AUTO_EXPIRY_DISABLED = "PROPOSAL_AUTO_EXPIRY_DISABLED",

  TASK_CREATED = "TASK_CREATED",
  TASK_UPDATED = "TASK_UPDATED",
  TASK_DUPLICATED = "TASK_DUPLICATED",
  TASK_ASSIGNEE_UPDATED = "TASK_ASSIGNEE_UPDATED",
  TASK_DELETED = "TASK_DELETED",
  COMMENT_ADDED_TO_TASK = "COMMENT_ADDED_TO_TASK",
  COMMENT_UPDATED_TO_TASK = "COMMENT_UPDATED_TO_TASK",
  TASK_TEMPLATE_DELETED = "TASK_TEMPLATE_DELETED",
  TASK_TEMPLATE_CREATED = "TASK_TEMPLATE_CREATED",
  TASK_TEMPLATE_UPDATED = "TASK_TEMPLATE_UPDATED",
  TASK_TEMPLATE_LINE_ITEM_CREATED = "TASK_TEMPLATE_LINE_ITEM_CREATED",
  TASK_TEMPLATE_LINE_ITEM_UPDATED = "TASK_TEMPLATE_LINE_ITEM_UPDATED",
  TASK_TEMPLATE_LINE_ITEM_DELETED = "TASK_TEMPLATE_LINE_ITEM_DELETED",
  SCHEDULE_TEMPLATE_LINE_ITEM_DELETED = "SCHEDULE_TEMPLATE_LINE_ITEM_DELETED",
  SCHEDULE_TEMPLATE_LINE_ITEM_CREATED = "SCHEDULE_TEMPLATE_LINE_ITEM_CREATED",
  SCHEDULE_TEMPLATE_LINE_ITEM_UPDATED = "SCHEDULE_TEMPLATE_LINE_ITEM_UPDATED",
  SCHEDULE_TEMPLATE_CREATED = "SCHEDULE_TEMPLATE_CREATED",
  SCHEDULE_TEMPLATE_UPDATED = "SCHEDULE_TEMPLATE_UPDATED",
  SCHEDULE_TEMPLATE_DELETED = "SCHEDULE_TEMPLATE_DELETED",
  SCHEDULE_CHECKLIST_ASSIGNED = "SCHEDULE_CHECKLIST_ASSIGNED",
  SCHEDULE_CHECKLIST_COMPLETED = "SCHEDULE_CHECKLIST_COMPLETED",
  SCHEDULE_CHECKLIST_INCOMPLETE = "SCHEDULE_CHECKLIST_INCOMPLETE",
  WORKER_TYPE_CREATED = "WORKER_TYPE_CREATED",
  WORKER_TYPE_UPDATED = "WORKER_TYPE_UPDATED",
  WORKER_TYPE_DELETED = "WORKER_TYPE_DELETED",
  WORKER_CREATED = "WORKER_CREATED",
  WORKER_UPDATED = "WORKER_UPDATED",
  WORKER_DELETED = "WORKER_DELETED",
  SHIFT_CREATED = "SHIFT_CREATED",
  SHIFT_ATTENDANCE_CREATED = "SHIFT_ATTENDANCE_CREATED",
  SHIFT_ATTENDANCE_UPDATED = "SHIFT_ATTENDANCE_UPDATED",
  SHIFT_ATTENDANCE_DELETED = "SHIFT_ATTENDANCE_DELETED",
  SHIFT_UPDATED = "SHIFT_UPDATED",
  SHIFT_DELETED = "SHIFT_DELETED",
}
