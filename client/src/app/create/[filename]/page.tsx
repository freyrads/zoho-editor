"use client";

import useLoggedInAs from "@/hooks/useLoggedInAs";
import { createDocument } from "@/services/root";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { inspect } from "util";

export default function Create() {
  const params = useParams();

  const [createResponse, setCreateResponse] = useState<any>();
  const { loggedInAs, setLoggedInAs } = useLoggedInAs();
  console.log(loggedInAs);
  const userId = loggedInAs?.id;

  const loadingRef = useRef(false);

  const [src, setSrc] = useState<string>();

  const filename = params.filename;

  const shouldCreateDoc = !!filename?.length && !!userId;

  const execCreate = async () => {
    if (loadingRef.current) return;

    try {
      loadingRef.current = true;

      const data = await createDocument({
        user_id: String(userId!),
        filename: filename as string,
      });

      console.log({ data });

      const { documentUrl } = data?.data ?? {};

      if (!documentUrl) return;

      setCreateResponse(data);
      setSrc(documentUrl);
    } catch (e) {
      console.log(e);
    } finally {
      loadingRef.current = false;
    }
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
