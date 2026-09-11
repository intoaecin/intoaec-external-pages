import { useEffect } from "react";
import PageLoader from "@/features/components/Loader/PageLoader";
import { useEnv } from "@/features/hooks/useEnv";

export default function HomeRedirect() {
  const { VITE_WEBSITE_URL } = useEnv();

  useEffect(() => {
    const destination = VITE_WEBSITE_URL?.trim();
    if (destination) {
      window.location.replace(destination);
    }
  }, [VITE_WEBSITE_URL]);

  return <PageLoader />;
}
