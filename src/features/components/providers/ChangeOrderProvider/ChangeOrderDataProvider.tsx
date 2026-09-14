/**
 * Client-side replacement for intoaec-UI's `getServerSideProps` on
 * `src/pages/change-order-preview/[changeOrderId].tsx`. This app is a static
 * Vite SPA with no server of its own, so there is no SSR equivalent — the
 * two requests that page's `getServerSideProps` used to make on the server
 * (fetch the change order, then best-effort fetch the organization's display
 * name) are made here instead, on mount, from the browser.
 *
 * Shape mirrors `BoqClientEstimateDataProvider`
 * (`src/features/components/providers/BoqProvider/BoqClientEstimateDataProvider.tsx`):
 * a context exposing `{ data, loading, error, refetch }`-style fields, backed
 * by `useAxios` (apiKey-only, no next-auth).
 */

import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import type { ChangeOrderPreviewData } from "@/features/changeOrder/components/ChangeOrderPreview";
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface ChangeOrderDataContextType {
  changeOrder?: ChangeOrderPreviewData;
  organizationName: string;
  loading: boolean;
  error: boolean;
  refetch: () => Promise<void>;
}

const ChangeOrderDataContext = createContext<
  ChangeOrderDataContextType | undefined
>(undefined);

interface ChangeOrderDataProviderProps {
  children: ReactNode;
  changeOrderId: string;
}

export const ChangeOrderDataProvider: React.FC<
  ChangeOrderDataProviderProps
> = ({ children, changeOrderId }) => {
  const { VITE_PROPOSAL_ENDPOINT, VITE_USERHUB_ENDPOINT } = useEnv();
  const { post: fetchChangeOrderById } = useAxios<any>(
    `${VITE_PROPOSAL_ENDPOINT}/change-order`,
  );
  const { post: fetchOrganizationSocialMedia } = useAxios<any>(
    `${VITE_USERHUB_ENDPOINT}/myorganization`,
  );

  const [changeOrder, setChangeOrder] = useState<ChangeOrderPreviewData>();
  const [organizationName, setOrganizationName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const fetchChangeOrder = useCallback(async () => {
    if (!changeOrderId) {
      setChangeOrder(undefined);
      setOrganizationName("");
      setError(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);
    try {
      const response = await fetchChangeOrderById({
        eventType: "FETCH_CHANGE_ORDER_BY_ID",
        changeOrderId,
      });

      const fetchedChangeOrder: ChangeOrderPreviewData | undefined =
        response?.code === "CHANGE_ORDER_RETRIEVED_SUCCESSFULLY"
          ? response.body
          : undefined;

      if (!fetchedChangeOrder) {
        setChangeOrder(undefined);
        setOrganizationName("");
        setError(true);
        return;
      }

      setChangeOrder(fetchedChangeOrder);

      // Best-effort organization display name — matches the source
      // getServerSideProps' own try/catch-and-continue: a failure here
      // must not block the rest of the preview from rendering.
      if (fetchedChangeOrder.organizationId) {
        try {
          const organizationResponse = await fetchOrganizationSocialMedia({
            eventType: "FETCH_ORGANIZATION_SOCIAL_MEDIA",
            organizationId: fetchedChangeOrder.organizationId,
          });
          setOrganizationName(
            organizationResponse?.body?.organizationName ?? "",
          );
        } catch {
          setOrganizationName("");
        }
      } else {
        setOrganizationName("");
      }
    } catch (err) {
      console.error("Failed to fetch change order", err);
      setChangeOrder(undefined);
      setOrganizationName("");
      setError(true);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeOrderId]);

  useEffect(() => {
    void fetchChangeOrder();
  }, [fetchChangeOrder]);

  return (
    <ChangeOrderDataContext.Provider
      value={{
        changeOrder,
        organizationName,
        loading,
        error,
        refetch: fetchChangeOrder,
      }}
    >
      {children}
    </ChangeOrderDataContext.Provider>
  );
};

export const useChangeOrderData = (): ChangeOrderDataContextType => {
  const context = useContext(ChangeOrderDataContext);

  if (!context) {
    return {
      organizationName: "",
      loading: true,
      error: false,
      refetch: async () => {},
    };
  }

  return context;
};
