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
import { useTranslation } from "react-i18next";
import {
  getCommentParties,
  nonEmptyString,
} from "@/features/RFQAndPO/utils/commentParties";

interface PoCommentsType {
  poEntityId?: string; // Optional because it can be either LINE_ITEM or TERMS_AND_CONDITION
  poEntityType: "LINE_ITEM" | "TERMS_AND_CONDITION";
  senderId: string;
  senderName?: string; // Optional
  senderType: string;
  receiverId: string;
  receiverType: string;
  receiverName?: string;
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
  saveComments?: () => Promise<void>;
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
  const { t } = useTranslation();

  const saveComments = async () => {
    if (!poComments.length) {
      toast.info(t("toast.noNewComments"));
      return;
    }
    const { sender, receiver } = getCommentParties(vendorRfqData);
    const requestData: any = {
      eventType: "ADD_COMMENTS_TO_PURCHASE_ORDER",
      poId: vendorRfqData?.poId,
      poTitle: nonEmptyString(vendorRfqData?.poTitle),
      clientId: nonEmptyString(router?.query?.clientId),
      projectId: nonEmptyString(
        router?.query?.projectId ?? vendorRfqData?.projectId
      ),
      poSerial: nonEmptyString(vendorRfqData?.poSerial),
      isWorkOrder: vendorRfqData?.isWorkOrder,
      senderId: sender.id,
      senderType: sender.type,
      receiverId: receiver.id,
      receiverType: receiver.type,
      comments: poComments,
      ...(organizationId
        ? {
            organizationId: organizationId,
            currentUserName: sender.name,
            senderName: sender.name,
            receiverName: receiver.name,
          }
        : {}),
    };

    const data: any = await fetch(requestData);
    if (data?.code === "PURCHASE_ORDER_COMMENTS_ADDED") {
      toast.success(t("toast.commentsSaved"));
      // Clear the pending batch so the next save doesn't resend it, then
      // replace the optimistic thread with what the server stored.
      setPoComments([]);
      await fetchRfqComments();
    } else {
      toast.error(t("toast.commentsSaveFailed"));
    }
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
    const { sender, receiver } = getCommentParties(vendorRfqData);
    setPoComments((prev) => [
      ...prev,
      {
        poEntityId: vendorRfqLineItemId,
        poEntityType:
          vendorRfqLineItemId === "termsAndCondition"
            ? "TERMS_AND_CONDITION"
            : "LINE_ITEM",
        senderId: sender.id ?? "",
        senderName: sender.name,
        senderType: sender.type,
        receiverId: receiver.id ?? "",
        receiverType: receiver.type,
        receiverName: receiver.name,
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
