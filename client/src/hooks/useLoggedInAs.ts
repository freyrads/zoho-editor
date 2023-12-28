import { IGetUsersResponse } from "@/interfaces/api";
import { useEffect, useState } from "react";

let currentValue: IGetUsersResponse | undefined;
const setters: ((newVal?: IGetUsersResponse) => void)[] = [];

const setSetLoggedInAs = (newVal?: IGetUsersResponse) => {
  currentValue = newVal;

  for (const set of setters) {
    set(newVal);
  }
};

type ISetter = (typeof setters)[number];

const addSetter = (setter: ISetter) => {
  setters.push(setter);
};

const removeSetter: typeof addSetter = (setter) => {
  const idx = setters.findIndex((s) => s === setter);
  if (idx < 0) return idx;

  setters.splice(idx, 1);

  return idx;
};

export default function useLoggedInAs() {
  const [loggedInAs, setLoggedInAs] = useState<IGetUsersResponse | undefined>(
    currentValue,
  );

  useEffect(() => {
    addSetter(setLoggedInAs);

    return () => {
      removeSetter(setLoggedInAs);
    };
  }, []);

  return { loggedInAs, setLoggedInAs: setSetLoggedInAs };
}
