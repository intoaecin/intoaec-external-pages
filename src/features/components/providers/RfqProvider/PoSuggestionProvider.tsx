import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useRouter } from "next/router";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";

interface PoCommentsType {
  poEntityId?: string; // Optional because it can be either LINE_ITEM or TERMS_AND_CONDITION
  poEntityType: "LINE_ITEM" | "TERMS_AND_CONDITION";
  senderId: string;
  senderName?: string; // Optional
  senderType: string;
  receiverId: string;
  receiverType: string;
  comments: string;
}

interface PoCommentsResponseType {
  vendorRfqLineItemId: string;
  comments: string;
  receiverId?: string;
  receiverType: string;
  senderId: string;
  vendorRfqId?: string;
}
type StructuredPoCommentsType = {
  [key: string]: PoCommentsResponseType[];
};
interface PoSuggestionContextType {
  // saveComments: (comments: any) => Promise<any>;
  saveComments?: () => void;
  addComments?: (vendorRfqLineItemId: string, comment: string) => void;
  setPoComments?: React.Dispatch<React.SetStateAction<PoCommentsType[]>>;
  setStructuredPoComments: React.Dispatch<
    React.SetStateAction<StructuredPoCommentsType | undefined>
  >;
  poComments?: PoCommentsType[];
  structuredPoComments?: StructuredPoCommentsType;
}

const PoSuggestionContext = createContext<PoSuggestionContextType | undefined>(
  undefined
);

interface PoSuggestionProviderProps {
  children: ReactNode;
  vendorRfqId: string;
  vendorRfqData?: any;
  organizationId?: string;
}

export const PoSuggestionProvider: React.FC<PoSuggestionProviderProps> = ({
  children,
  vendorRfqId,
  vendorRfqData,
  organizationId,
}) => {
  const {  VITE_PROCUREMENT_ENDPOINT } =
    useEnv();
  const { post: fetch } = useAxiosWithAuth<any>(
    `${VITE_PROCUREMENT_ENDPOINT}/${organizationId ? "session" : "po"}`
  );
  const router = useRouter();
  const [poComments, setPoComments] = useState<PoCommentsType[]>([]);
  const [structuredPoComments, setStructuredPoComments] =
    useState<StructuredPoCommentsType>();
  const hostname = window.location.hostname;

  const saveComments = async () => {
    //    save comment api
    const requestData: any = {
      eventType: "ADD_COMMENTS_TO_PURCHASE_ORDER",
      poId: vendorRfqData?.poId,
      poTitle: vendorRfqData?.poTitle,
      clientId:router?.query?.clientId,
      projectId:router?.query?.projectId ?? vendorRfqData?.projectId,
      poSerial:vendorRfqData?.poSerial,
      isWorkOrder: vendorRfqData?.isWorkOrder,
      senderId: hostname.includes("app") ? vendorRfqData?.senderId : vendorRfqData?.receiverId,
      // senderName:vendorRfqData?
      senderType: hostname.includes("app") ? vendorRfqData?.senderType : vendorRfqData?.receiverType,
      receiverId: hostname.includes("app") ? vendorRfqData?.receiverId : vendorRfqData?.senderId,
      receiverType: hostname.includes("app") ? vendorRfqData?.receiverType : vendorRfqData?.senderType,
      comments: poComments,
      ...(organizationId ? {
        organizationId: organizationId,
        currentUserName: vendorRfqData?.createdBy,
        senderName: vendorRfqData?.createdBy,
        receiverName: vendorRfqData?.receiverName,
      } : {}),
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
        eventType: "FETCH_COMMENTS_FOR_PURCHASE_ORDER",
        poId:vendorRfqData.poId,
        organizationId: organizationId,
      };
      const data: any = await fetch(requestData);

      if (data.code === "PURCHASE_ORDER_COMMENTS_RETRIEVED") {
        setStructuredPoComments(data?.body?.commentsByItemName);
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

    setPoComments((prev) => [
      ...prev,
      {
        poEntityId: vendorRfqLineItemId,
        poEntityType: vendorRfqLineItemId !== "termsAndCondition " ? "LINE_ITEM" : "TERMS_AND_CONDITION",
        senderId: vendorRfqData?.senderId ? vendorRfqData?.senderId : "AEC",
        senderName: vendorRfqData?.createdBy ?? "",
        senderType: vendorRfqData?.senderType,
        receiverId: vendorRfqData?.receiverId,
        receiverType: vendorRfqData?.receiverType
          ? vendorRfqData?.receiverType
          : "VENDOR",
        receiverName: vendorRfqData?.receiverName,
        comments: comment,
      },
    ]);
  };

  return (
    <PoSuggestionContext.Provider
      value={{
        saveComments,
        addComments,
        setPoComments,
        setStructuredPoComments,
        poComments,
        structuredPoComments,
      }}
    >
      {children}
    </PoSuggestionContext.Provider>
  );
};

export const usePoCommentsData = () => {
  const context = useContext(PoSuggestionContext);

  if (!context) {
    return {} as PoSuggestionContextType;
  }

  return context;
};
