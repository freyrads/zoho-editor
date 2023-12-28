import Link from "next/link";
import { ILinkMapProps } from "@/interfaces/components";

export default function LinkMap({ links }: Readonly<ILinkMapProps>) {
  return (
    <>
      {links.map(({ href, desc }) => (
        <Link
          key={href}
          className="border rounded-[6px] bg-white px-[12px] py-[8px] active:bg-black active:text-white hover:bg-[#ffffffa0]"
          href={href}
        >
          {desc}
        </Link>
      ))}
    </>
  );
}
