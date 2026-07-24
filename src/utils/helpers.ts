export const getQuestionKey = (question: string) => {
    switch (question) {
      case "Define your project type - Lets shape your vision":
        return "defineProjectType";
      case "Specify your exact project location!":
        return "specifyLocation";
      case "Which method is your preferred way to be contacted?":
        return "preferredContactMethod";
      case "Specify the area your project will cover?":
        return "specifyProjectArea";
      case "When is the most convenient time for us to connect with you?":
        return "preferredTimeToConnect";
      case "Mind dropping your virtual postcard? Your email, please!":
        return "emailRequest";
      case "Could I please have your phone number for coordination purposes?":
        return "phoneRequest";
      case "And Finally, What is your name?":
        return "nameRequest";
      case "What type of construction project are we conducting quality control for?":
        return "constructionProjectType";
      case "What are the critical quality standards or specifications that need to be upheld for this construction project?":
        return "qualityStandards";
      case "What specific aspects or phases of the project require quality control inspection?":
        return "qualityControlPhases";
      case "What are the primary quality control objectives for this project?":
        return "qualityControlObjectives";
      case "What is the timeline for conducting quality control inspections throughout the project duration?":
        return "qualityControlTimeline";
      case "Who are the primary stakeholders involved in overseeing quality control on the project, and what is the preferred mode of communication with them regarding quality issues?":
        return "qualityControlStakeholders";
      case "Are there any specific testing or sampling requirements for materials used in the construction project?":
        return "materialTestingRequirements";
      case "Are there any site-specific environmental factors or conditions that may impact quality control on the construction site?":
        return "environmentalFactors";
      case "What level of quality control reporting and documentation is expected, and how frequently should quality updates be provided?":
        return "qualityControlReporting";
      case "Are there any additional instructions, preferences, or concerns you have regarding my role as the Quality Control professional for this project?":
        return "additionalInstructions";
      default:
        return question;
    }
  };


  export const getDayTranslationKey = (dayName?: string) => {
    const dayMap: { [key: string]: string } = {
      'Sun': 'sunday',
      'Mon': 'monday',
      'Tue': 'tuesday',
      'Wed': 'wednesday',
      'Thu': 'thursday',
      'Fri': 'friday',
      'Sat': 'saturday'
    };
    return dayMap[dayName || ''] || dayName;
  };

export const getAnswerTranslationKey = (answer: string) => {
  const answerMap: { [key: string]: string } = {
    "Building construction (residential, commercial, industrial)": "buildingConstruction",
    "Civil infrastructure (roads, bridges, utilities)": "civilInfrastructure",
    "Heavy construction (dams, airports, stadiums)": "heavyConstruction",
    "Renovation or remodeling": "renovationRemodeling",
    "Structural components (foundation, framing)": "structuralComponents",
    "Mechanical, Electrical, Plumbing (MEP) systems": "mepSystems",
    "Finishing works (flooring, painting, fixtures)": "finishingWorks",
    "Documentation and record-keeping": "documentationRecordKeeping",
    "Ensure product/service consistency and reliability": "productServiceConsistency",
    "Meet regulatory or industry standards": "meetStandards",
    "Minimize defects and rework": "minimizeDefects",
    "Improve customer satisfaction": "improveCustomerSatisfaction"
  };

  return answerMap[answer] || answer;
};

export const getMonthValueForSubscriptionFrequency = (frequency: string) => {
  switch (frequency){
    case 'monthly':
      return 1
      break;
    case 'quarterly':
      return 3
      break;
    case 'half-yearly':
      return 6
      break;
    case 'annually':
      return 12
      break;
    default:
      return 1
  }
};