import { useEffect } from "react";
import PageLoader from "@/features/components/Loader/PageLoader";
import { useEnv } from "@/features/hooks/useEnv";

export default function HomeRedirect() {
  const { NEXT_PUBLIC_WEBSITE_URL } = useEnv();

  useEffect(() => {
    const destination = NEXT_PUBLIC_WEBSITE_URL?.trim();
    if (destination) {
      window.location.replace(destination);
    }
  }, [NEXT_PUBLIC_WEBSITE_URL]);

  return <PageLoader />;
}
