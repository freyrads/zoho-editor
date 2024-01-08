"use client";

import useLoggedInAs from "@/hooks/useLoggedInAs";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const { loggedInAs, setLoggedInAs } = useLoggedInAs();
  const router = useRouter();

  console.log({ loggedInAsLogoutButton: loggedInAs });

  const handleLogout = () => {
    setLoggedInAs();
    router.push("/");
  };

  return (
    <div
      id="logout-btn-container"
      className="hidden absolute right-0 top-0 pr-[10px] pt-[10px]"
    >
      <button
        id="logout-btn"
        className="btn-look gap-[10px]"
        onClick={handleLogout}
      ></button>
    </div>
  );
}
