import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { v4 as uuid } from "uuid";
import { EstimateSuggestionType, SuggestionType } from "@/types";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useEstimationData } from "./BoqClientEstimateDataProvider";
import { useRouter } from "next/router";

interface EstimateSuggestionContextType {
  estimateComments?: EstimateSuggestionType[];
  initialEstimateComment?: EstimateSuggestionType[];
  // saveComments: (comments: any) => Promise<any>;
  saveComments: (comments: any) => Promise<any>;
  clientCommentAction: (
    commentText: string,
    currentId: string,
    idType: "ITEM" | "SECTION"
  ) => void;
  AdminReasonCommentAction: ({
    commentId,
    reason,
    acceptedAt,
    declinedAt,
  }: {
    commentId: string;
    reason?: any;
    acceptedAt?: number;
    declinedAt?: number;
  }) => void;
  setEstimateComments: React.Dispatch<
    React.SetStateAction<EstimateSuggestionType[] | undefined>
  >;
}

const EstimateSuggestionContext = createContext<
  EstimateSuggestionContextType | undefined
>(undefined);

interface EstimateSuggestionProviderProps {
  children: ReactNode;
  withAuth?: boolean;
  entityType?: "ESTIMATE" | "SALES_ORDER";
}

export const EstimateSuggestionProvider: React.FC<
  EstimateSuggestionProviderProps
> = ({ children, withAuth, entityType = "ESTIMATE" }) => {
  const { VITE_PROPOSAL_ENDPOINT } = useEnv();
  const { post: fetch } = useAxios<any>(
    `${VITE_PROPOSAL_ENDPOINT}/${entityType === "SALES_ORDER" ? "lead-sales-order" : "lead-estimate"}`,
    withAuth
  );
  const { projectId, clientEstimationData } = useEstimationData();
  const router = useRouter();
  const [estimateComments, setEstimateComments] =
    useState<EstimateSuggestionType[]>();

  const [initialEstimateComment, setInitialEstimateComment] =
    useState<EstimateSuggestionType[]>();

  const estimateId = clientEstimationData?.estimateId as string;
  const estimateRevision = clientEstimationData?.estimateRevision as number;

  const [updatedComments, setUpdatedComments] = useState<string[]>([]);
  console.log(projectId, "project id from suggestion provider");
  const saveComments = async (comments: any) => {
    //    save comment api
    const requestData: any = {
      eventType: entityType === "SALES_ORDER" ? "CREATE_SALES_ORDER_COMMENTS" : "CREATE_BOQ_ESTIMATE_COMMENTS",
      ...(entityType === "SALES_ORDER" ? { salesOrderId: estimateId } : { estimateId }),
      projectId: projectId,
      organizationId: clientEstimationData?.organizationId,
      organizationType: clientEstimationData?.organizationType,
      leadId: clientEstimationData?.leadId,
      estimateRevision: estimateRevision,
      comments,
      isLeadManagerProfile: router.query.isLeadManagerProfile,
      ...(withAuth ? { updatedComments } : {}),
    };
    const data: any = await fetch(requestData);
    const commentsCreatedSuccessfully =
      entityType === "SALES_ORDER"
        ? data.code === "SALES_ORDER_COMMENTS_UPDATED"
        : data.code === "BOQ_ESTIMATION_COMMENTS_CREATED_SUCCESSFULLY";

    if (commentsCreatedSuccessfully) {
      fetchEstimateComments(estimateId, estimateRevision);
      return data;
    } else {
      throw new Error(data?.error ?? data?.code ?? "Unable to save comments");
    }
  };

  const fetchEstimateComments = async (
    clientEstimateId: string | string[] | undefined,
    estimateRevision: any
  ) => {
    // fetch client estimate api
    try {
      const requestData: any = {
        eventType: entityType === "SALES_ORDER" ? "FETCH_SALES_ORDER_COMMENTS" : "FETCH_ESTIMATION_COMMENTS",
        ...(entityType === "SALES_ORDER" ? { salesOrderId: clientEstimateId } : { estimateId: clientEstimateId }),
        estimateRevision: estimateRevision,
      };
      const data: any = await fetch(requestData);
      const commentsRetrievedSuccessfully =
        entityType === "SALES_ORDER"
          ? data.code === "SALES_ORDER_COMMENTS_RETRIEVED"
          : data.code === "BOQ_ESTIMATION_COMMENTS_RETRIEVED_SUCCESSFULLY";

      if (commentsRetrievedSuccessfully) {
        console.log(data, "estimate fetc commetn data");
        setInitialEstimateComment(data?.body);
        setEstimateComments(data?.body);
      }
    } catch (error: any) {
      console.log(error);
      toast.error("Error while fetching estimate comments data");
    }
  };

  useEffect(() => {
    fetchEstimateComments(estimateId, estimateRevision);
  }, [estimateId]);

  const clientCommentAction = (
    commentText: string,
    currentId: string,
    idType: "ITEM" | "SECTION"
  ): void => {
    setEstimateComments((prev) => [
      ...(prev || []),
      {
        commentId: uuid(),
        estimateId: estimateId ? estimateId : "1e",
        projectId: projectId ? projectId : "1p",
        id: currentId,
        idType: idType,
        clientSuggestion: commentText,
        leadId: clientEstimationData?.leadId,
      },
    ]);
  };

  const AdminReasonCommentAction = ({
    commentId,
    reason,
    acceptedAt,
    declinedAt,
  }: {
    commentId: string;
    reason?: any;
    acceptedAt?: number;
    declinedAt?: number;
  }): void => {
    setUpdatedComments((prev) => [...prev, commentId]);
    const updatedComment = estimateComments?.map((prev) =>
      prev?.commentId === commentId
        ? {
            ...prev,
            ...(reason ? { reply: reason } : {}),
            ...(acceptedAt && !declinedAt ? { acceptedAt, declinedAt: 0 } : {}),
            ...(declinedAt && !acceptedAt ? { acceptedAt: 0, declinedAt } : {}),
          }
        : prev
    );
    console.log(updatedComment, "updated comments");
    setEstimateComments(updatedComment);
  };
  return (
    <EstimateSuggestionContext.Provider
      value={{
        estimateComments,
        saveComments,
        clientCommentAction,
        setEstimateComments,
        AdminReasonCommentAction,
        initialEstimateComment,
      }}
    >
      {children}
    </EstimateSuggestionContext.Provider>
  );
};

export const useEstimateCommentsData = () => {
  const context = useContext(EstimateSuggestionContext);

  if (!context) {
    return {} as EstimateSuggestionContextType;
  }

  return context;
};
