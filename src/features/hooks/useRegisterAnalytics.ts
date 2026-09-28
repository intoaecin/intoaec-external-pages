import axios from "axios";
import { useEnv } from "./useEnv";

type AnalyticsEventType =
  | "REGISTER_PROPOSAL_ANALYTICS"
  | "REGISTER_ESTIMATE_ANALYTICS"
  | "REGISTER_SALES_ORDER_ANALYTICS";

const ANALYTICS_ROUTES: Record<AnalyticsEventType, string> = {
  REGISTER_PROPOSAL_ANALYTICS: "lead-proposals",
  REGISTER_ESTIMATE_ANALYTICS: "lead-estimate",
  REGISTER_SALES_ORDER_ANALYTICS: "lead-sales-order",
};

/**
 * Records client view/time-spent/download analytics for proposals, estimates
 * and sales orders by posting straight to the Proposal service's public
 * events (no intoaec-UI `/api/add-to-queue` hop).
 */
export const useRegisterAnalytics = () => {
  const { VITE_PROPOSAL_ENDPOINT, VITE_APIKEY } = useEnv();

  return (
    payload: { eventType: AnalyticsEventType } & Record<string, unknown>
  ) =>
    axios.post(
      `${VITE_PROPOSAL_ENDPOINT}/${ANALYTICS_ROUTES[payload.eventType]}`,
      payload,
      { headers: VITE_APIKEY ? { apiKey: VITE_APIKEY } : undefined }
    );
};
