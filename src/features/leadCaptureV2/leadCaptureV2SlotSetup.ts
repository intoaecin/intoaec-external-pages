import { LeadCaptureStore } from "@/lib/leadCapture/leadCaptureStore";

export const isLeadCaptureV2SlotSetupComplete = (): boolean => {
  const leadCaptureData = LeadCaptureStore.getRawState().leadCaptureData;
  return Boolean(
    leadCaptureData?.selectedDate &&
      leadCaptureData?.preferredSlot?.generatedSlotId,
  );
};

export const getLeadCaptureV2SlotSubmitFields = (): {
  preferredSlot?: NonNullable<
    NonNullable<
      ReturnType<typeof LeadCaptureStore.getRawState>["leadCaptureData"]
    >["preferredSlot"]
  >;
  meetingType?: string;
} => {
  const leadCaptureData = LeadCaptureStore.getRawState().leadCaptureData;
  if (!leadCaptureData?.preferredSlot?.generatedSlotId) {
    return {};
  }

  return {
    preferredSlot: leadCaptureData.preferredSlot,
    meetingType: leadCaptureData.meetingType ?? "OFFLINE",
  };
};
