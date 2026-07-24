import { useContext } from "react";
import { FixtureContext } from "../components/providers/FixturesProviders";

export const useUsersData = (filter?: any) => {
  const { usersData } = useContext(FixtureContext);
  return { usersData };
};
