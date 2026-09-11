import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { fetchContentFromS3 } from "@/lib/helpers";
import { LeadProposalDataType, SuggestionType } from "@/types";
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
import { useLeadProposalData } from "../LeadProposalProvider";
import { useQueryParams } from "@/hooks/useQueryParams";
import { useRouter } from "next/router";

interface ProposalSuggestionContextType {
  controllerComments?: SuggestionType;
  intialComments?: SuggestionType;
  saveComments: (comments: any) => Promise<any>;
  setControllerComments: React.Dispatch<
    React.SetStateAction<SuggestionType | undefined>
  >;
}

const ProposalSuggestionContext = createContext<
  ProposalSuggestionContextType | undefined
>(undefined);

interface ProposalSuggestionProviderProps {
  children: ReactNode;
  leadProposalId: string;
  proposalRevision: any;
  withAuth?: boolean;
}

export const ProposalSuggestionProvider: React.FC<
  ProposalSuggestionProviderProps
> = ({ children, leadProposalId, withAuth, proposalRevision }) => {
  const { VITE_PROPOSAL_ENDPOINT } = useEnv();
  const { post: fetch } = useAxios<any>(
    `${VITE_PROPOSAL_ENDPOINT}/lead-proposals`,
    withAuth
  );
  const router = useRouter();
  const { proposalData } = useLeadProposalData();
  const [controllerComments, setControllerComments] =
    useState<SuggestionType>();
  const { isLeadManagerProfile } = useQueryParams();

  const [intialComments, setIntialComments] = useState<SuggestionType>();

  const saveComments = async (comments: any) => {
    const requestData: any = {
      eventType: "ADD_PROPOSAL_COMMENTS",
      leadProposalId: leadProposalId,
      proposalRevision: proposalRevision,
      projectName: proposalData?.projectName,
      comments,
      isLeadManagerProfile: router.query.isLeadManagerProfile,
    };
    const data: any = await fetch(requestData);
    if (data.code === "COMMENT_ADDED_TO_PROPOSAL") {
      fetchProposalComments(leadProposalId);
      return data;
    } else {
      throw new Error(data?.error);
    }
  };

  const fetchProposalComments = async (
    leadProposalId: string | string[] | undefined
  ) => {
    try {
      const requestData: any = {
        eventType: "GET_PROPOSAL_COMMENTS",
        leadProposalId: leadProposalId,
        proposalRevision: proposalRevision,
      };
      const data: any = await fetch(requestData);
      if (data.code === "COMMENTS_RETRIEVED") {
        setIntialComments(data?.body?.suggestion);
        setControllerComments(data?.body?.suggestion);
      }
    } catch (error: any) {
      console.log(error);
      toast.error("Error while fetching proposal data");
    }
  };
  useEffect(() => {
    fetchProposalComments(leadProposalId);
  }, [leadProposalId]);

  return (
    <ProposalSuggestionContext.Provider
      value={{
        controllerComments,
        saveComments,
        setControllerComments,
        intialComments,
      }}
    >
      {children}
    </ProposalSuggestionContext.Provider>
  );
};

// Custom hook to use the context
export const useProposalComments = () => {
  const context = useContext(ProposalSuggestionContext);

  if (!context) {
    throw new Error(
      "useProposalComments must be used within a TemplateProposalProvider"
    );
  }

  return context;
};
