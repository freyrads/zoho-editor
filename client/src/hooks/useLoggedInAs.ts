import { IGetUsersResponse } from "@/interfaces/api";
import { useEffect, useState } from "react";

let currentValue: IGetUsersResponse | undefined;
const setters: ((newVal?: IGetUsersResponse) => void)[] = [];

const setSetLoggedInAs = (newVal?: IGetUsersResponse) => {
  currentValue = newVal;

  if (newVal) localStorage.setItem("user", JSON.stringify(newVal));
  else localStorage.removeItem("user");

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

const checkValue = () => {
  if (currentValue) return;

  const lUser = localStorage.getItem("user");
  if (!lUser) return;

  currentValue = JSON.parse(lUser);

  return currentValue;
};

export default function useLoggedInAs() {
  const [val, setVal] = useState<IGetUsersResponse | undefined>(currentValue);

  useEffect(() => {
    const savedVal = checkValue();
    if (savedVal && currentValue !== val) setVal(savedVal);

    addSetter(setVal);

    return () => {
      removeSetter(setVal);
    };
  }, []);

  return { loggedInAs: val, setLoggedInAs: setSetLoggedInAs };
}
