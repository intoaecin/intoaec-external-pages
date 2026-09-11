import { useEffect, useState } from "react";
import { useAxios, useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";

type State = {
  ready: boolean;
  allProjectIds: string[];
};

const initialState: State = { ready: false, allProjectIds: [] };

export interface UseAllBillsExpensesProjectIdsOptions {
  organizationType?: string;
  /**
   * When false, calls Leadmanager `/session` with organizationId and
   * organizationType in the body (public bills/expenses report).
   */
  withAuth?: boolean;
}

/**
 * Loads organization project ids (GET_PROJECT_NAMES) so the bills/expenses
 * report can scope the first request to all projects.
 */
export function useAllBillsExpensesProjectIds(
  organizationId?: string,
  options?: UseAllBillsExpensesProjectIdsOptions,
) {
  const withAuth = options?.withAuth ?? true;
  const organizationType = options?.organizationType;
  const { NEXT_PUBLIC_LEADMANAGER_ENDPOINT } = useEnv();
  const { post: postAuthed } = useAxiosWithAuth<any>(
    `${NEXT_PUBLIC_LEADMANAGER_ENDPOINT}/fetch`,
  );
  const { post: postLeadmanagerSession } = useAxios<any>(
    `${NEXT_PUBLIC_LEADMANAGER_ENDPOINT}/session`,
  );
  const post = withAuth ? postAuthed : postLeadmanagerSession;
  const [state, setState] = useState<State>(initialState);

  useEffect(() => {
    if (!organizationId) {
      setState(initialState);
      return;
    }
    if (!withAuth && !organizationType) {
      setState({ ready: true, allProjectIds: [] });
      return;
    }
    let cancelled = false;
    setState({ ready: false, allProjectIds: [] });

    const payload = withAuth
      ? { eventType: "GET_PROJECT_NAMES" }
      : {
          eventType: "GET_PROJECT_NAMES",
          organizationId,
          organizationType,
        };

    post(payload)
      .then((res) => {
        if (cancelled) return;
        let body: unknown =
          res?.code === "PROJECTS_RETRIEVED" ? (res.body ?? []) : [];
        if (typeof body === "string") {
          try {
            body = JSON.parse(body) as unknown;
          } catch {
            body = [];
          }
        }
        const rows = Array.isArray(body) ? body : [];
        const allProjectIds = rows
          .map((p: { projectId?: string }) => p.projectId)
          .filter(
            (id: unknown): id is string =>
              typeof id === "string" && id.length > 0,
          );
        setState({ ready: true, allProjectIds });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ ready: true, allProjectIds: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [organizationId, organizationType, withAuth]);

  const isLoading = !!organizationId && !state.ready;

  return { ...state, isLoading };
}

