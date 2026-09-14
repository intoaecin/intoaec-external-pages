import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import {
  decryptAES,
  encryptAES,
  fetchContentFromS3,
  getLocalizationValue,
} from "@/lib/helpers";
import {
  BoqClientEstiamteSectionResponseType,
  BoqClientEstimateResponseType,
} from "@/types";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export interface ClientEstimateDataContextType {
  clientEstimateSectionData?: BoqClientEstiamteSectionResponseType[];
  clientEstimationData?: BoqClientEstimateResponseType;
  projectId?: string;
  loading?: boolean;
  organizationDetail?: {
    emailId?: string;
    mobileNumber?: string;
    adminSign?: string;
    organizationName?: string;
  };
  fetchEstimationData?: () => Promise<void>;
  estimatePaymentLink?: string;
  isStripeIntegrated?: boolean;
  paymentLinkLoading?: boolean;
}

const ClientEstimateDataContext = createContext<
  ClientEstimateDataContextType | undefined
>(undefined);

interface ClientEstimateDataProviderProps {
  children: ReactNode;
  withAuth?: boolean;
  estimateId: string;
  estimateRevision: any;
  includeTrash?: boolean;
  entityType?: "ESTIMATE" | "SALES_ORDER";
}

export const ClientEstimateDataProvider: React.FC<
  ClientEstimateDataProviderProps
> = ({ children, withAuth, estimateId, estimateRevision, includeTrash, entityType = "ESTIMATE" }) => {
  const {
    VITE_ACCESS_KEY,
    VITE_APP_URL,
    VITE_LEADMANAGER_ENDPOINT,
    VITE_PROPOSAL_ENDPOINT,
    VITE_USERHUB_ENDPOINT,
  } = useEnv();
  const { post: fetch } = useAxios<any>(
    `${VITE_PROPOSAL_ENDPOINT}/${entityType === "SALES_ORDER" ? "lead-sales-order" : "lead-estimate"}`,
    withAuth
  );
  const { post: fetchUserHub } = useAxios(
    `${VITE_USERHUB_ENDPOINT}/myorganization`,
    withAuth
  );
  const { post: integrationPost } = useAxios(
    `${VITE_USERHUB_ENDPOINT}/integrations`,
    withAuth,
  );
  const { post: organizationPost } = useAxios(
    `${VITE_USERHUB_ENDPOINT}/organization`,
    withAuth,
  );
  const { post: sessionPost } = useAxios(
    `${VITE_USERHUB_ENDPOINT}/session`,
    withAuth,
  );
  const { post: localizationPost } = useAxios(
    `${VITE_USERHUB_ENDPOINT}/userhub`,
    withAuth,
  );
  const { post: leadPost } = useAxios(
    `${VITE_LEADMANAGER_ENDPOINT}/fetch`,
    withAuth,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [clientEstimateSectionData, setClientEstimateSectionData] =
    useState<BoqClientEstiamteSectionResponseType[]>();
  const [clientEstimationData, setClinetEstimationData] =
    useState<BoqClientEstimateResponseType>();
  const [organizationDetail, setOrganizationDetail] = useState<{
    emailId?: string;
    mobileNumber?: string;
    adminSign?: string;
    organizationName?: string;
  }>({});
  const [estimatePaymentLink, setEstimatePaymentLink] = useState<string>();
  const [isStripeIntegrated, setIsStripeIntegrated] = useState(false);
  const [paymentLinkLoading, setPaymentLinkLoading] = useState(false);

  const projectId = clientEstimationData?.projectId;

  const createEstimatePaymentLink = async (
    estimate: BoqClientEstimateResponseType,
  ) => {
    const organizationId = estimate.organizationId;
    const organizationType = estimate.organizationType ?? "AEC";
    const receiverId = estimate.projectId;

    if (!organizationId || !receiverId) return;

    setPaymentLinkLoading(true);
    try {
      const [
        superAdminResponse,
        addressResponse,
        organizationResponse,
        stripeResponse,
        localizationResponse,
        leadResponse,
      ] = await Promise.all([
        sessionPost({
          eventType: "GET_ORGANIZATION_SUPER_USER",
          organizationId,
        }),
        organizationPost({
          eventType: "GET_ORGANIZATION_ADDRESS_INFO",
          organizationId,
        }),
        organizationPost({
          eventType: "GET_ORGANIZATION_DETAILS",
          organizationId,
        }),
        integrationPost({
          eventType: "GET_INTEGRATION_DETAILS",
          organizationId,
          organizationType,
          name: "STRIPE",
        }),
        localizationPost({
          eventType: "FETCH_ORGANIZATION_LOCALIZATION",
          organizationId,
          organizationType,
        }),
        leadPost({
          eventType: "GET_LEAD_BY_ID",
          projectId: receiverId,
          organizationId,
          organizationType,
        }),
      ]);

      const publishKey = Array.isArray(stripeResponse?.body)
        ? stripeResponse.body.find(
            (item: { keyName?: string; valueofKey?: string }) =>
              item.keyName === "publishKey" && item.valueofKey,
          )
        : undefined;
      const decryptedPublishKey = publishKey?.valueofKey
        ? decryptAES(publishKey.valueofKey, VITE_ACCESS_KEY)
        : "";

      setIsStripeIntegrated(Boolean(decryptedPublishKey));
      if (!decryptedPublishKey) {
        setEstimatePaymentLink(undefined);
        return;
      }

      const localization = localizationResponse?.body ?? [];
      const lead = leadResponse?.body?.lead;
      const superAdmin = superAdminResponse?.body?.[0];
      const paymentTerms = (estimate.estimatePaymentTerms ?? []).filter(
        (term) => term.status !== "PAID" && !term.isPaid,
      );
      const encryptedData = await encryptAES(
        JSON.stringify({
          sourceType: entityType,
          salesOrderId: entityType === "SALES_ORDER" ? estimate.estimateId : undefined,
          estimateId: estimate.estimateId,
          estimateRevision: estimate.estimateRevision,
          estimateTitle: estimate.estimateTitle,
          estimatePaymentTerms: paymentTerms,
          fullName: superAdmin?.lastName
            ? `${superAdmin.firstName} ${superAdmin.lastName}`
            : superAdmin?.firstName,
          emailId: superAdmin?.emailId,
          mobileNumber: superAdmin?.mobileNumber,
          organizationName: organizationResponse?.body?.organizationName,
          accountId:
            organizationResponse?.body?.accountNumber ??
            organizationResponse?.body?.accountId,
          organizationId,
          senderId: organizationId,
          senderType: organizationType,
          receiverId,
          publishKey: decryptedPublishKey,
          organizationAddress: addressResponse?.body ?? {},
          timeZone: getLocalizationValue(localization, "TIMEZONE", "ID"),
          dateFormat: getLocalizationValue(localization, "DATE", "FORMAT"),
          currencyCode:
            getLocalizationValue(localization, "CURRENCY", "CODE") ?? "USD",
          currency:
            getLocalizationValue(localization, "CURRENCY", "SYMBOL") ?? "$",
          clientInformation: {
            fullName: lead?.leadName ?? "-",
            emailId: lead?.leadEmail ?? "",
            mobileNumber: lead?.leadMobile ?? "",
            projectType: leadResponse?.body?.projectType ?? "",
          },
          clientEmail: lead?.leadEmail,
        }),
        VITE_ACCESS_KEY,
      );
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : VITE_APP_URL ?? "";
      setEstimatePaymentLink(
        `${origin}/estimatePayments/checkout-payment?data=${encodeURIComponent(
          encryptedData,
        )}`,
      );
    } catch (error) {
      console.error("Estimate payment link generation failed", error);
      setEstimatePaymentLink(undefined);
      setIsStripeIntegrated(false);
    } finally {
      setPaymentLinkLoading(false);
    }
  };
  const fetchOrganizationDetails = async (organizationId: string) => {
    try {
      const requestData: any = {
        eventType: "FETCH_ORGANIZATION_SOCIAL_MEDIA",
        // estimateId: "fc4ede06-1d18-435b-b1e7-8ee65f8f3494",
        organizationId,
      };
      const data: any = await fetchUserHub(requestData);
      console.log(data, "signature");
      // console.log(data.body?.Organizations_logoUrl, "organization detail");
      if (data.code === "ORGANIZATION_SOCIAL_MEDIA_FETCH_SUCCESS") {
        setOrganizationDetail((prev) => ({
          ...(prev ?? {}),
          organizationName: data.body.organizationName,
          organizationWebsite: data.body.websiteOrBlog,
          organizationLogo:
            data.body?.Organizations_logoUrl ?? data.body?.org_logoUrl,
          adminSign:
            data.body?.org_eSignUrl ?? data.body.Organizations_eSignUrl,
        }));
      }
    } catch (error: any) {
      console.log(error);
    }
  };
  const fetchEstimateDetails = async (
    clientEstimateId?: string | string[] | undefined,
    estimateRevision?: string | string[] | undefined
  ) => {
    // fetch client estimate api
    try {
      const requestData: any = {
        eventType: entityType === "SALES_ORDER" ? "FETCH_SALES_ORDER_BY_ID" : "FETCH_ESTIMATION_BY_ID",
        ...(entityType === "SALES_ORDER" ? { salesOrderId: clientEstimateId } : { estimateId: clientEstimateId }),
        estimateRevision: estimateRevision ?? "LATEST",
        includeTrash,
      };
      const data: any = await fetch(requestData);

      if (data.code === "ESTIMATION_RETRIEVED_SUCCESSFULLY" || data.code === "SALES_ORDER_RETRIEVED_SUCCESSFULLY") {
        console.log(data);
        // setInitialEstimateComment(data?.body?.suggestion);
        // setEstimateComments(data?.body?.suggestion)
        setClinetEstimationData(data?.body);
        await createEstimatePaymentLink(data.body);
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  const fetchEstimateSections = async (
    organizationId: string,
    clientEstimateId?: string | string[] | undefined,
    estimateRevision?: string | string[] | undefined
  ) => {
    // fetch client estimate api
    try {
      const requestData: any = {
        eventType: entityType === "SALES_ORDER" ? "GET_SECTIONS_BY_SALES_ORDER_ID" : "GET_SECTIONS_BY_ESTIMATE_ID",
        // estimateId: "fc4ede06-1d18-435b-b1e7-8ee65f8f3494",
        ...(entityType === "SALES_ORDER" ? { salesOrderId: clientEstimateId } : { estimateId: clientEstimateId }),
        organizationId: organizationId,
        estimateRevision: estimateRevision,
        organizationType: "AEC",
        includeTrash,
      };
      const data: any = await fetch(requestData);

      if (data.code === "SECTIONS_RETRIEVED_SUCCESSFULLY" || data.code === "SALES_ORDER_SECTIONS_RETRIEVED_SUCCESSFULLY") {
        console.log(data);
        setClientEstimateSectionData(data.body);
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  const fetchOrganizationSuperAdminDetails = async (organizationId: string) => {
    try {
      const requestData: any = {
        eventType: "GET_ORGANIZATION_SUPER_USER",
        // estimateId: "fc4ede06-1d18-435b-b1e7-8ee65f8f3494",
        organizationId,
      };
      const data: any = await fetchUserHub(requestData);
      console.log(data, "data from clinet estiat provider");
      if (data.code === "ORGANIZATION_SUPER_USER_DETAILS_RETRIEVED") {
        setOrganizationDetail({
          emailId: data.body[0].emailId,
          mobileNumber: data.body[0].mobileNumber,
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (clientEstimationData?.organizationId) {
      fetchOrganizationSuperAdminDetails(
        clientEstimationData?.organizationId ?? ""
      );
      fetchOrganizationDetails(clientEstimationData?.organizationId ?? "");
      fetchEstimateSections(
        clientEstimationData?.organizationId || "",
        estimateId,
        estimateRevision
      );
    }
  }, [clientEstimationData]);

  const fetchEstimationData = async (targetEstimateId?: any) => {
    await fetchEstimateDetails(targetEstimateId ?? estimateId, estimateRevision);
  };
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await fetchEstimateDetails(estimateId, estimateRevision);
      } catch (err) {
        // fetchEstimateDetails handles errors internally
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [estimateId, estimateRevision, includeTrash]);
  console.log(
    clientEstimationData,
    clientEstimateSectionData,
    "fetched estimation details"
  );
  return (
    <ClientEstimateDataContext.Provider
      value={{
        clientEstimateSectionData,
        clientEstimationData,
        projectId,
        loading,
        organizationDetail,
        fetchEstimationData,
        estimatePaymentLink,
        isStripeIntegrated,
        paymentLinkLoading,
      }}
    >
      {children}
    </ClientEstimateDataContext.Provider>
  );
};

export const useEstimationData = (): ClientEstimateDataContextType => {
  const context = useContext(ClientEstimateDataContext);

  if (!context) {
    return {} as ClientEstimateDataContextType;
  }

  return context;
};
