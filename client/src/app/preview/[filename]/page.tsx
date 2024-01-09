"use client";

import { Editor } from "@/components/Editor";
import useLoggedInAs from "@/hooks/useLoggedInAs";
import { getDocument } from "@/services/root";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PreviewFile() {
  const params = useParams();

  const { loggedInAs } = useLoggedInAs();
  const userId = loggedInAs?.id;

  const [previewSrc, setPreviewSrc] = useState<string>();

  const filename = params.filename;
  const shouldPreviewDoc = !!filename?.length && !!userId;

  const { data, ...restQuery } = useQuery({
    queryKey: ["get-document", filename],
    queryFn: () => getDocument({ document_id: filename as string }),
    enabled: shouldPreviewDoc,
  });

  useEffect(() => {
    const { previewUrl, preview_url } = data?.data ?? {};

    if (!previewUrl && !preview_url) return;

    setPreviewSrc(preview_url ?? previewUrl);
  }, [data]);

  console.log({ data, ...restQuery });

  if (!shouldPreviewDoc)
    return <div>No filename provided or not logged in</div>;

  return (
    <Editor
      data={data?.data}
      src={previewSrc}
      saveButtonOptions={{
        hide: true as const,
      }}
    />
  );
}
