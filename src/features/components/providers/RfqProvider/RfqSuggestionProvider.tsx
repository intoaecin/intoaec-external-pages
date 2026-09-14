import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useEnv } from "@/features/hooks/useEnv";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useOrganization } from "../OrganizationThemeProvider";

interface RfqCommentsType {
  vendorRfqLineItemId: string;
  comment: string;
}

interface RfqCommentsResponseType {
  vendorRfqLineItemId: string;
  comment: string;
  receiverId?: string;
  receiverType: string;
  senderId: string;
  vendorRfqId?: string;
}
type StructuredRfqCommentsType = {
  [key: string]: RfqCommentsResponseType[];
};
interface RfqSuggestionContextType {
  // saveComments: (comments: any) => Promise<any>;
  saveComments?: () => void;
  addComments?: (vendorRfqLineItemId: string, comment: string) => void;
  setRfqComments?: React.Dispatch<React.SetStateAction<RfqCommentsType[]>>;
  setStructuredRfqComments: React.Dispatch<
    React.SetStateAction<StructuredRfqCommentsType | undefined>
  >;
  RfqComments?: RfqCommentsType[];
  structuredRfqComments?: StructuredRfqCommentsType;
}

const RfqSuggestionContext = createContext<
  RfqSuggestionContextType | undefined
>(undefined);

interface RfqSuggestionProviderProps {
  children: ReactNode;
  vendorRfqId: string;
  vendorRfqData?: any;
  withAuth?: boolean;
}

export const RfqSuggestionProvider: React.FC<RfqSuggestionProviderProps> = ({
  children,
  vendorRfqId,
  vendorRfqData,
  withAuth = true,
}) => {
  const {  VITE_PROCUREMENT_ENDPOINT } =
    useEnv();
  const { post: fetch } = useAxiosWithAuth<any>(
    `${VITE_PROCUREMENT_ENDPOINT}/${withAuth ? "rfq" : "session"}`
  );
  const router = useRouter();
  const [RfqComments, setRfqComments] = useState<RfqCommentsType[]>([]);
  const [structuredRfqComments, setStructuredRfqComments] =
    useState<StructuredRfqCommentsType>();
  const [updatedComments, setUpdatedComments] = useState<string[]>([]);

  const { organizationId } = useOrganization();
  const hostname = window.location.hostname;

  const saveComments = async () => {
    //    save comment api
    const requestData: any = {
      eventType: "ADD_COMMENT_TO_RFQ",
      organizationId: organizationId,
      organizationType: "AEC",
      vendorRfqId: vendorRfqId ?? vendorRfqData?.vendorRfqId,
      clientId: router?.query?.clientId,
      projectId: router?.query?.projectId ?? vendorRfqData?.projectId,
      senderId: hostname.includes("app") ? vendorRfqData?.senderId : vendorRfqData?.receiverId,
      // senderName:vendorRfqData?
      rfqName: vendorRfqData?.rfq?.rfqName,
      senderType: hostname.includes("app") ? vendorRfqData?.senderType : vendorRfqData?.receiverType,
      receiverId: hostname.includes("app") ? vendorRfqData?.receiverId : vendorRfqData?.senderId,
      receiverType: hostname.includes("app") ? vendorRfqData?.receiverType : vendorRfqData?.senderType,
      vendorRfqLineItemComments: RfqComments,
      ...(!withAuth
        ? {
            organizationId: organizationId,
            currentUserName: vendorRfqData?.createdBy,
            senderName: vendorRfqData?.createdBy,
            receiverName: vendorRfqData?.receiverName,
          }
        : {}),
    };
    const data: any = await fetch(requestData);
    // if (data.code === "BOQ_ESTIMATION_COMMENTS_CREATED_SUCCESSFULLY") {
    //   return data;
    // } else {
    //   throw new Error(data?.error);
    // }
  };

  const fetchRfqComments = async () => {
    // fetch client estimate api
    try {
      const requestData: any = {
        eventType: "FETCH_VENDOR_RFQ_COMMENTS",
        vendorRfqId,
      };
      const data: any = await fetch(requestData);

      if (data.code === "RFQ_COMMENTS_RETRIEVED") {
        setStructuredRfqComments(data?.body?.commentsByItemName);
      }
    } catch (error: any) {
      console.log(error);
      toast.error("Error while fetching estimate comments data");
    }
  };
  useEffect(() => {
    if (vendorRfqId) {
      fetchRfqComments();
    }
  }, [vendorRfqId]);
  const addComments = (vendorRfqLineItemId: string, comment: string) => {

    setRfqComments((prev) => [
      ...(prev || []),
      {
        vendorRfqLineItemId: vendorRfqLineItemId,
        comment,
      },
    ]);
  };

  return (
    <RfqSuggestionContext.Provider
      value={{
        saveComments,
        addComments,
        setRfqComments,
        setStructuredRfqComments,
        RfqComments,
        structuredRfqComments,
      }}
    >
      {children}
    </RfqSuggestionContext.Provider>
  );
};

export const useRfqCommentsData = () => {
  const context = useContext(RfqSuggestionContext);

  if (!context) {
    return {} as RfqSuggestionContextType;
  }

  return context;
};
