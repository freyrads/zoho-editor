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
      <button className="btn-look gap-[10px]" onClick={handleLogout}>
        <span>{loggedInAs?.name}</span>
        <span>Log out button</span>
      </button>
    </div>
  );
}
