import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";

interface CreateLeadCaptureTemplateProviderProps {
  leadCaptureTemplateData?: leadCaptureTemplateDataType;
  setLeadCaptureTemplateData?: Dispatch<
    SetStateAction<leadCaptureTemplateDataType | undefined>
  >;
  selectedPage?: string;
  selectedPageIndex?: number;
  editMode?: boolean;
  setSelectedPageIndex?: Dispatch<SetStateAction<number>>;
  setSelectedPage?: Dispatch<SetStateAction<string | undefined>>;
  setEditMode?: Dispatch<SetStateAction<boolean>>;
  loading?: boolean;
  isMacroBinding?: boolean;
  macroBindingError?: unknown;
}

type leadCaptureTemplateDataType = {
  leadCaptureTemplateId?: string;
  title?: string;
  description?: string;
  pages?: Array<any>;
  macros?: Array<any>;
};

export const CreateLeadCaptureTemplateContext =
  createContext<CreateLeadCaptureTemplateProviderProps>({
    leadCaptureTemplateData: {
      leadCaptureTemplateId: "",
    },
  });

export const CreateLeadCaptureTemplateProvider = ({
  children,
  withAuth: _withAuth = false,
}: {
  children: ReactNode;
  withAuth?: boolean;
}) => {
  const { VITE_PROPOSAL_ENDPOINT, VITE_AECPOSTMAN_ENDPOINT } =
    useEnv();
  const { post } = useAxios(VITE_PROPOSAL_ENDPOINT + "/session");
  const { post: bindMacroshandler } = useAxios(
    VITE_AECPOSTMAN_ENDPOINT + "/macros",
  );
  const [loading, setLoading] = useState(true);
  const [isMacroBinding, setIsMacroBinding] = useState(false);
  const [macroBindingError, setMacroBindingError] = useState<unknown>();
  const { organizationId, organizationType } = useOrganization();

  const bindTemplateMacros = async (
    templateData: leadCaptureTemplateDataType,
    requestContext: {
      organizationId?: string;
      organizationType?: string;
    },
    isMounted: () => boolean,
  ) => {
    const macros = templateData?.macros ?? [];

    if (!templateData?.pages || macros.length === 0) {
      return;
    }

    setIsMacroBinding(true);
    setMacroBindingError(undefined);

    try {
      const dataRes = await bindMacroshandler({
        eventType: "BIND_MACRO_VALUES",
        content: JSON.stringify(templateData.pages),
        macros,
        ...requestContext,
      });

      if (!isMounted()) return;

      setLeadCaptureTemplateData((prevData) => ({
        ...(prevData ?? templateData),
        pages: JSON.parse(dataRes.body),
      }));
    } catch (error) {
      if (!isMounted()) return;

      setMacroBindingError(error);
      console.error("Error binding lead capture macros:", error);
    } finally {
      if (isMounted()) {
        setIsMacroBinding(false);
      }
    }
  };

  const fetchData = async (isMounted: () => boolean) => {
    setLoading(true);
    try {
      const requestContext = {
        organizationId,
        organizationType,
      };
      const requestData = {
        eventType: "FETCH_LEAD_CAPTURE_TEMPLATE",
        ...requestContext,
      };

      const data = await post(requestData);
      if (!isMounted()) return;

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.code == "LEAD_CAPTURE_TEMPLATE_RETRIEVED") {
        setLeadCaptureTemplateData(data?.body);
        setLoading(false);
        void bindTemplateMacros(data?.body, requestContext, isMounted);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (organizationId && organizationType) {
      fetchData(() => isMounted);
    }

    return () => {
      isMounted = false;
    };
  }, [organizationId, organizationType]);

  const [leadCaptureTemplateData, setLeadCaptureTemplateData] =
    useState<leadCaptureTemplateDataType>();
  const [selectedPage, setSelectedPage] = useState<string>();
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [editMode, setEditMode] = useState(false);
  return (
    <CreateLeadCaptureTemplateContext.Provider
      value={{
        leadCaptureTemplateData,
        setLeadCaptureTemplateData,
        selectedPage,
        selectedPageIndex,
        setSelectedPage,
        setSelectedPageIndex,
        setEditMode,
        editMode,
        loading,
        isMacroBinding,
        macroBindingError,
      }}
    >
      {children}
    </CreateLeadCaptureTemplateContext.Provider>
  );
};

export const useLeadCaptureTemplate = () =>
  useContext(CreateLeadCaptureTemplateContext);
