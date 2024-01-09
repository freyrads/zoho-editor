"use client";

import { Editor } from "@/components/Editor";
import useLoggedInAs from "@/hooks/useLoggedInAs";
import { editDocument } from "@/services/root";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Edit() {
  const params = useParams();

  const [error, setError] = useState(false);
  const [createResponse, setCreateResponse] = useState<any>();
  const [isSheet, setIsSheet] = useState<boolean>();
  const { loggedInAs } = useLoggedInAs();
  console.log(loggedInAs);
  const userId = loggedInAs?.id;

  const loadingRef = useRef(false);

  const [src, setSrc] = useState<string>();

  const document_id = params.document_id;

  const shouldEditDoc = !!document_id?.length && !!userId;

  const execCreate = async () => {
    if (loadingRef.current) return;

    try {
      loadingRef.current = true;

      const data = await editDocument({
        user_id: String(userId!),
        document_id: document_id as string,
      });

      console.log({ data });

      const { documentUrl, document_url } = data?.data ?? {};

      if (!documentUrl && !document_url) {
        setError(true);
        return;
      }

      setCreateResponse(data);
      setSrc(document_url ?? documentUrl);
      setIsSheet(!!document_url?.length);
    } catch (e) {
      console.error(e);
    } finally {
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    if (!shouldEditDoc) return;

    execCreate();
  }, [shouldEditDoc]);

  if (!shouldEditDoc) return <div>No filename provided or not logged in</div>;

  if (error) return <h1>Error. Check console</h1>;

  if (typeof src !== "string" || typeof isSheet !== "boolean")
    return <h1>Loading</h1>;

  return (
    <Editor
      data={createResponse?.data}
      src={src}
      saveButtonOptions={{
        isSheet,
        saveUrlParams: {
          author_id: String(userId),
          doc_type: isSheet ? "sheet" : "writer",
        },
      }}
    />
  );
}
