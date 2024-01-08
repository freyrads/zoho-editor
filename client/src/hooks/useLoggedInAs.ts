import { IGetUsersResponse } from "@/interfaces/api";
import { useEffect, useState } from "react";

let currentValue: IGetUsersResponse | undefined;
const setters: ((newVal?: IGetUsersResponse) => void)[] = [];

const checkLogoutButton = (shouldShow: boolean) => {
  console.log({ shouldShow });

  if (typeof document === "undefined") return;

  const el = document.getElementById("logout-btn-container");

  console.log({ el });

  if (!el) return;

  const isHidden = el.classList.contains("hidden");

  if (shouldShow) {
    if (isHidden) {
      el.classList.remove("hidden");
    }

    return;
  }

  if (!isHidden) {
    el.classList.add("hidden");
  }
};

const setSetLoggedInAs = (newVal?: IGetUsersResponse) => {
  currentValue = newVal;

  if (newVal) {
    checkLogoutButton(true);
    localStorage.setItem("user", JSON.stringify(newVal));
  } else {
    checkLogoutButton(false);

    localStorage.removeItem("user");
  }
  for (const set of setters) {
    set(newVal ? { ...newVal } : newVal);
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
    console.log("Rerender");
    const savedVal = checkValue();
    if (savedVal && currentValue !== val) {
      console.log("setVal called");
      setVal({ ...savedVal });
      return;
    }

    addSetter(setVal);

    return () => {
      removeSetter(setVal);
    };
  }, []);

  console.log({ val });

  return { loggedInAs: val, setLoggedInAs: setSetLoggedInAs };
}
