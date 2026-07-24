import { CreateLeadCaptureTypes, CreateLeadTypes } from "@/types";
import { Store } from "pullstate";
import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";

interface LeadCaptureStoreType {
  leadCaptureData: Partial<CreateLeadCaptureTypes>;
}

export const LeadCaptureStore = new Store<Partial<LeadCaptureStoreType>>({});
