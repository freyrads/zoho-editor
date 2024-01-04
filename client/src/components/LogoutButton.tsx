"use client";

import useLoggedInAs from "@/hooks/useLoggedInAs";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const { loggedInAs, setLoggedInAs } = useLoggedInAs();
  const router = useRouter();

  console.log({ loggedInAs });

  if (!loggedInAs) return null;

  const handleLogout = () => {
    setLoggedInAs();
    router.push("/");
  };

  return (
    <div className="absolute left-0 top-0 pl-[10px] pt-[10px]">
      <button className="btn-look" onClick={handleLogout}>
        Log out button
      </button>
    </div>
  );
}