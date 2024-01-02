"use client";

import LinkMap from "@/components/LinkMap";
import useLoggedInAs from "@/hooks/useLoggedInAs";
import { getUsers } from "@/services/root";
import { useQuery } from "@tanstack/react-query";

const links = [
  {
    href: "/documents",
    desc: "List Document",
  },
  {
    href: "/sessions",
    desc: "List Session",
  },
  {
    href: "/upload",
    desc: "Upload",
  },
  {
    href: "/preview",
    desc: "Preview",
  },
  {
    href: "/create",
    desc: "Create",
  },
  {
    href: "/edit",
    desc: "Edit",
  },
  {
    href: "/delete",
    desc: "Delete",
  },
  {
    href: "/co-edit",
    desc: "Collab Edit",
  },
];

export default function Home() {
  const { loggedInAs, setLoggedInAs } = useLoggedInAs();

  const { data, ...restQuery } = useQuery({
    queryKey: ["get-users"],
    queryFn: getUsers,
  });

  console.log({ data, ...restQuery });

  const users = data?.data ?? [];

  if (!loggedInAs) {
    return (
      <div className="">
        <div>LOGIN AS USER</div>
        <ul>
          {users.map((u) => {
            const { id, name } = u;

            return (
              <li key={id}>
                <button className="btn-look" onClick={() => setLoggedInAs(u)}>
                  {name}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className="flex gap-[12px]">
      <LinkMap links={links} />
    </div>
  );
}
