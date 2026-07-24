import { LeadCaptureStore } from "@/lib/leadCapture/leadCaptureStore";
import { CreateLeadCaptureTypes, CreateLeadTypes } from "@/types";


export const setCreateLeadFormData:any = (formData: Partial<CreateLeadCaptureTypes>) => {
  LeadCaptureStore.update((s) => {
    s.leadCaptureData = { ...s.leadCaptureData, ...formData };
  });
};
