"use client";

import { Editor } from "@/components/Editor";
import useLoggedInAs from "@/hooks/useLoggedInAs";
import { createDocument } from "@/services/root";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function CreateMergeTemplate() {
  const params = useParams();
  const searchParams = useSearchParams();

  const [createResponse, setCreateResponse] = useState<any>();
  const { loggedInAs } = useLoggedInAs();
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
        is_merge_template: true,
        merge_document_id: document_id,
      });

      console.log({ data });

      const { documentUrl } = data?.data ?? {};

      if (!documentUrl) return;

      setCreateResponse(data);
      setSrc(documentUrl);
    } catch (e) {
      console.error(e);
    } finally {
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    if (!shouldCreateDoc) return;

    execCreate();
  }, [shouldCreateDoc]);

  const document_id_str = searchParams.get("document_id");

  const document_id = document_id_str?.length ? parseInt(document_id_str) : NaN;

  if (Number.isNaN(document_id)) return <h1>Invalid document_id</h1>;

  if (!shouldCreateDoc) return <div>No filename provided or not logged in</div>;

  return (
    <Editor
      data={createResponse?.data}
      src={src}
      saveButtonOptions={{
        saveUrlParams: {
          author_id: String(userId),
          doc_type: "writer",
          is_merge_template: "1",
        },
      }}
    />
  );
}
