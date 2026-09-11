import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { LeadProposalDataType } from "@/types";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import ProposalLinkExpired from "../ProposalLinkExpired";

interface LeadProposalContextType {
  proposalData?: LeadProposalDataType;
  setNewProposalRevision?: any;
  fetchData?: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const LeadProposalContext = createContext<LeadProposalContextType | undefined>(
  undefined
);

interface LeadProposalProviderProps {
  children: ReactNode;
  leadProposalId: string;
  proposalRevision: any;
  withAuth?: boolean;
  expiryCheck?: boolean;
}

export const LeadProposalProvider: React.FC<LeadProposalProviderProps> = ({
  children,
  leadProposalId,
  proposalRevision,
  withAuth,
  expiryCheck,
}) => {
  const { VITE_PROPOSAL_ENDPOINT, VITE_AECPOSTMAN_ENDPOINT } = useEnv();
  const { post: fetch } = useAxios<any>(
    `${VITE_PROPOSAL_ENDPOINT}/lead-proposals`,
    withAuth
  );
  const { post: bindMacros } = useAxios<any>(
    `${VITE_AECPOSTMAN_ENDPOINT}/macros`,
    false
  );
  const [newProposalRevision, setNewProposalRevision] = useState<any>();
  const [proposalData, setProposalData] = useState<LeadProposalDataType>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastBoundPagesContentRef = useRef<string>();

  const fetchProposalData = async (
    leadProposalId: string | string[] | undefined,
    proposalRevision: any,
    newProposalRevision?: any
  ) => {
    if (!leadProposalId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const requestData: any = {
        eventType: "FETCH_LEAD_PROPOSAL_BY_ID",
        leadProposalId: leadProposalId,
        proposalRevision: newProposalRevision
          ? `${newProposalRevision}`
          : `${proposalRevision}`,
      };
      const data: any = await fetch(requestData);
      if (data.code === "LEAD_PROPOSALS_RETRIEVED") {
        const proposal = data?.body;
        if (Array.isArray(proposal?.pages) && proposal.pages.length > 0) {
          const content = JSON.stringify(proposal.pages);
          if (!content || content === "[]" || lastBoundPagesContentRef.current === content) {
            setProposalData(proposal);
            return;
          }

          lastBoundPagesContentRef.current = content;

          try {
            const macroRes = await bindMacros({
              eventType: "BIND_MACRO_VALUES",
              macros: proposal?.macros ?? [],
              content,
              organizationId: proposal?.organizationId,
              organizationType: proposal?.organizationType,
              leadId: proposal?.leadId,
              projectId: proposal?.projectId,
            });
            const boundPagesStr = macroRes?.body;
            if (boundPagesStr) {
              const boundPages =
                typeof boundPagesStr === "string"
                  ? JSON.parse(boundPagesStr)
                  : boundPagesStr;
              proposal.pages = boundPages;
            }
          } catch (macroError) {
            console.error("Failed to bind macros on client:", macroError);
          }
        }
        setProposalData(proposal);
      } else {
        setProposalData(undefined);
        setError("PROPOSAL_NOT_FOUND");
      }
    } catch (error: any) {
      setProposalData(undefined);
      setError(error?.message ?? "PROPOSAL_FETCH_FAILED");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProposalData(leadProposalId, proposalRevision);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- useAxios post/response are unstable refs; omit to avoid re-fetch loops
  }, [leadProposalId, proposalRevision]);
  useEffect(() => {
    if (newProposalRevision > 0) {
      fetchProposalData(leadProposalId, proposalRevision, newProposalRevision);
    }
  }, [newProposalRevision]);
  const fetchData = async () => {
    await fetchProposalData(leadProposalId, proposalRevision);
  };

  // Check if proposal is expired based on expireAfterCount
  const isExpiredByCount =
    expiryCheck &&
    proposalData?.expireAfterCount &&
    proposalData.expireAfterCount > 0 &&
    proposalData.opened > proposalData.expireAfterCount;

  // Check if proposal is expired based on expireAt (only if expireAfterCount is 0 or not set)
  const isExpiredByTime =
    proposalData?.expireAt &&
    expiryCheck &&
    (!proposalData?.expireAfterCount || proposalData.expireAfterCount === 0) &&
    proposalData.expireAt <= Date.now();

  return (
    <LeadProposalContext.Provider
      value={{ proposalData, fetchData, setNewProposalRevision, loading, error }}
    >
      {isExpiredByCount || isExpiredByTime ? (
        <ProposalLinkExpired />
      ) : (
        <>{children}</>
      )}
    </LeadProposalContext.Provider>
  );
};

// Custom hook to use the context
export const useLeadProposalData = () => {
  const context = useContext(LeadProposalContext);

  if (!context) {
    throw new Error(
      "useTemplateProposalData must be used within a TemplateProposalProvider"
    );
  }

  return context;
};
