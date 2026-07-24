import { deepClone } from "@/lib/helpers";
import { useRef } from "react";

const useMutableState = <T>(initialValue?: T) => {
  const mutableStateRef = useRef(initialValue);

  const getState = () => mutableStateRef.current;
  const setState = (newValue: T) => {
    mutableStateRef.current = undefined;
    mutableStateRef.current = newValue;
  };

  return [getState, setState] as const;
};

export default useMutableState;
