"use client";

import useLoggedInAs from "@/hooks/useLoggedInAs";
import { createDocument } from "@/services/root";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { inspect } from "util";

export default function Preview() {
  const params = useParams();

  const [createResponse, setCreateResponse] = useState<any>();
  const { loggedInAs, setLoggedInAs } = useLoggedInAs();
  console.log(loggedInAs);
  const userId = loggedInAs?.id;

  const [src, setSrc] = useState<string>();

  const filename = params.filename;

  const shouldCreateDoc = !!filename?.length && !!userId;

  const execCreate = async () => {
    const data = await createDocument({
      user_id: String(userId!),
      filename: filename as string,
    });

    const { documentUrl } = data?.data ?? {};

    if (!documentUrl) return;

    setCreateResponse(data);
    setSrc(documentUrl);
  };

  useEffect(() => {
    if (!shouldCreateDoc) return;

    execCreate();
  }, [shouldCreateDoc]);

  if (!shouldCreateDoc) return <div>No filename provided or not logged in</div>;

  return (
    <main className="flex min-h-screen max-h-screen overflow-hidden flex-col items-center">
      {inspect(createResponse?.data) ?? "Loading..."}
      <div className="flex w-[1000px]">
        <iframe
          name="preview-iframe"
          width="100%"
          height={500}
          src={src}
        ></iframe>
      </div>
    </main>
  );
}
