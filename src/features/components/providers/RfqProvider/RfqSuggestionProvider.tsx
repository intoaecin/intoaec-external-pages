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
import { useTranslation } from "react-i18next";
import {
  getCommentParties,
  nonEmptyString,
} from "@/features/RFQAndPO/utils/commentParties";
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
  saveComments?: () => Promise<void>;
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
  const { t } = useTranslation();

  const saveComments = async () => {
    if (!RfqComments.length) {
      toast.info(t("toast.noNewComments"));
      return;
    }
    const { sender, receiver } = getCommentParties(vendorRfqData);
    // The backend schema is strict: omit null/empty optional strings rather
    // than sending them, or the whole request is rejected with a 400.
    const requestData: any = {
      eventType: "ADD_COMMENT_TO_RFQ",
      organizationId: organizationId,
      organizationType: "AEC",
      vendorRfqId: vendorRfqId ?? vendorRfqData?.vendorRfqId,
      clientId: nonEmptyString(router?.query?.clientId),
      projectId: nonEmptyString(
        router?.query?.projectId ?? vendorRfqData?.projectId
      ),
      senderId: sender.id,
      rfqName: nonEmptyString(vendorRfqData?.rfq?.rfqName),
      senderType: sender.type,
      receiverId: receiver.id,
      receiverType: receiver.type,
      vendorRfqLineItemComments: RfqComments,
      ...(!withAuth
        ? {
            currentUserName: sender.name,
            senderName: sender.name,
            receiverName: receiver.name,
          }
        : {}),
    };
    const data: any = await fetch(requestData);
    if (data?.code === "COMMENTS_ADDED_TO_RFQ") {
      toast.success(t("toast.commentsSaved"));
      // Clear the pending batch so the next save doesn't resend it, then
      // replace the optimistic thread with what the server stored.
      setRfqComments([]);
      await fetchRfqComments();
    } else {
      toast.error(t("toast.commentsSaveFailed"));
    }
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
