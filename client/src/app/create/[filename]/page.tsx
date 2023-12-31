"use client";

import { Editor } from "@/components/Editor";
import useLoggedInAs from "@/hooks/useLoggedInAs";
import { createDocument } from "@/services/root";
import { isValidDocType } from "@/utils";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Create() {
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
  const docType = searchParams.get("type") ?? "writer";

  const execCreate = async () => {
    if (loadingRef.current) return;

    if (!isValidDocType(docType)) {
      console.error("Invalid docType", docType);
      return;
    }

    try {
      loadingRef.current = true;

      const params = {
        user_id: String(userId!),
        filename: filename as string,
        type: docType,
      };

      const data = await createDocument(params);

      console.log({ data });

      const { documentUrl, document_url } = data?.data ?? {};

      if (!documentUrl && !document_url) return;

      setCreateResponse(data);
      setSrc(document_url ?? documentUrl);
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

  if (!shouldCreateDoc) return <div>No filename provided or not logged in</div>;

  if (!isValidDocType(docType)) return <h1>Invalid type</h1>;

  return (
    <Editor
      data={createResponse?.data}
      src={src}
      saveButtonOptions={{
        isSheet: docType === "sheet",
        saveUrlParams: {
          author_id: String(userId),
          doc_type: docType,
        },
      }}
    />
  );
}
