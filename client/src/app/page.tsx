import Link from "next/link";

const links = [
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
  return (
    <div className="flex h-screen w-screen justify-center items-center">
      <div className="flex gap-[12px]">
        {links.map(({ href, desc }) => (
          <Link
            key={href}
            className="border rounded-[6px] bg-white px-[12px] py-[8px] active:bg-black active:text-white hover:bg-[#ffffffa0]"
            href={href}
          >
            {desc}
          </Link>
        ))}
      </div>
    </div>
  );
}
