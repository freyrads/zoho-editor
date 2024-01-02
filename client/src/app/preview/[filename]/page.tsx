"use client";

import useLoggedInAs from "@/hooks/useLoggedInAs";
import { getDocument } from "@/services/root";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { inspect } from "util";

export default function PreviewFile() {
  const params = useParams();

  const { loggedInAs, setLoggedInAs } = useLoggedInAs();
  const userId = loggedInAs?.id;

  const [previewSrc, setPreviewSrc] = useState<string>();

  const filename = params.filename;
  const shouldPreviewDoc = !!filename?.length && !!userId;

  const { data, ...restQuery } = useQuery({
    queryKey: ["get-document"],
    queryFn: () => getDocument({ document_id: filename as string }),
    enabled: shouldPreviewDoc,
  });

  useEffect(() => {
    const { previewUrl } = data?.data ?? {};

    if (!previewUrl) return;

    setPreviewSrc(previewUrl);
  }, [data]);

  console.log({ data, ...restQuery });

  if (!shouldPreviewDoc)
    return <div>No filename provided or not logged in</div>;

  return (
    <main className="flex min-h-screen max-h-screen min-w-screen max-w-screen overflow-hidden flex-col items-center">
      <div className="break-all">
        {data?.data ? inspect(data.data) : "Loading..."}
      </div>
      <div className="flex w-[1000px]">
        <iframe
          name="preview-iframe"
          width="100%"
          height={500}
          src={previewSrc}
        ></iframe>
      </div>
    </main>
  );
}
