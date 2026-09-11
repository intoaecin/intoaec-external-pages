import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchLeadCaptureV2 } from "../api/fetchLeadCaptureV2";
import { fetchLeadCaptureV2ServiceTypes } from "../api/fetchLeadCaptureV2ServiceTypes";
import {
  filterLeadCaptureV2ServicesForForm,
  parseLeadCaptureV2FormFromApi,
  type ParsedLeadCaptureV2Form,
} from "../leadCaptureV2ApiMappers";
import type { LeadCaptureV2Service } from "../components/leadCaptureV2LayoutConfig";

type LeadCaptureV2ExternalOrganizationContext = {
  organizationId?: string;
  organizationType?: string;
};

type LeadCaptureV2ExternalFormState = {
  loading: boolean;
  error: boolean;
  parsedForm: ParsedLeadCaptureV2Form | null;
  services: LeadCaptureV2Service[];
};

const initialState: LeadCaptureV2ExternalFormState = {
  loading: true,
  error: false,
  parsedForm: null,
  services: [],
};

export const useLeadCaptureV2ExternalForm = (
  organization: LeadCaptureV2ExternalOrganizationContext | null,
) => {
  const router = useRouter();
  const { VITE_LEADMANAGER_ENDPOINT, VITE_DEFAULT_ORGANIZATION_TYPE } =
    useEnv();
  const { post: fetchForm } = useAxios(
    `${VITE_LEADMANAGER_ENDPOINT}/session`,
    false,
  );
  const { post: fetchServiceTypes } = useAxios(
    `${VITE_LEADMANAGER_ENDPOINT}/session`,
    false,
  );
  const fetchFormRef = useRef(fetchForm);
  const fetchServiceTypesRef = useRef(fetchServiceTypes);
  const organizationId = organization?.organizationId;
  const organizationType = organization?.organizationType;
  const [state, setState] = useState<LeadCaptureV2ExternalFormState>(initialState);

  const leadCaptureV2Id = useMemo(() => {
    const queryValue = router.query.leadCaptureV2Id;
    if (typeof queryValue === "string") return queryValue;
    if (Array.isArray(queryValue) && queryValue[0]) return queryValue[0];
    return null;
  }, [router.query.leadCaptureV2Id]);

  const resolvedOrganizationType =
    organizationType ?? VITE_DEFAULT_ORGANIZATION_TYPE;

  useEffect(() => {
    fetchFormRef.current = fetchForm;
    fetchServiceTypesRef.current = fetchServiceTypes;
  });

  const loadForm = useCallback(async () => {
    if (!leadCaptureV2Id || !organizationId || !resolvedOrganizationType) {
      return;
    }

    setState((currentState) => ({
      ...currentState,
      loading: true,
      error: false,
    }));

    try {
      const context = {
        organizationId,
        organizationType: resolvedOrganizationType,
        username: "external",
      };

      const [formBody, serviceTypes] = await Promise.all([
        fetchLeadCaptureV2(fetchFormRef.current, context, leadCaptureV2Id),
        fetchLeadCaptureV2ServiceTypes(
          fetchServiceTypesRef.current,
          context,
          leadCaptureV2Id,
        ),
      ]);

      if (!formBody?.leadCaptureV2Id) {
        setState({
          loading: false,
          error: true,
          parsedForm: null,
          services: [],
        });
        return;
      }

      const parsedForm = parseLeadCaptureV2FormFromApi(formBody);

      setState({
        loading: false,
        error: false,
        parsedForm,
        services: filterLeadCaptureV2ServicesForForm(
          serviceTypes,
          leadCaptureV2Id,
          parsedForm.serviceFieldsByServiceId,
        ),
      });
    } catch {
      setState({
        loading: false,
        error: true,
        parsedForm: null,
        services: [],
      });
    }
  }, [
    leadCaptureV2Id,
    organizationId,
    resolvedOrganizationType,
  ]);

  useEffect(() => {
    if (!router.isReady) return;
    if (!leadCaptureV2Id || !organizationId) {
      setState({
        loading: false,
        error: true,
        parsedForm: null,
        services: [],
      });
      return;
    }

    void loadForm();
  }, [
    leadCaptureV2Id,
    loadForm,
    organizationId,
    router.isReady,
  ]);

  return {
    leadCaptureV2Id,
    organizationId,
    organizationType: resolvedOrganizationType,
    ...state,
    refetch: loadForm,
  };
};
