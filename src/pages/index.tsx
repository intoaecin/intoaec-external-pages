import type { GetServerSideProps, NextPage } from "next";
import { useEffect } from "react";
import { useEnv } from "@/features/hooks/useEnv";

export const getServerSideProps: GetServerSideProps = async () => {
  const destination = process.env.NEXT_PUBLIC_WEBSITE_URL?.trim();
  if (destination) {
    return {
      redirect: {
        destination,
        permanent: false,
      },
    };
  }
  return { props: {} };
};

const Home: NextPage = () => {
  const { NEXT_PUBLIC_WEBSITE_URL } = useEnv();

  useEffect(() => {
    const destination = NEXT_PUBLIC_WEBSITE_URL?.trim();
    if (destination) {
      window.location.replace(destination);
    }
  }, [NEXT_PUBLIC_WEBSITE_URL]);

  return null;
};

export default Home;
