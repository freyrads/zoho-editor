"use client";

import useLoggedInAs from "@/hooks/useLoggedInAs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { inspect } from "util";

interface ICreateDocumentResponse {
  documentUrl: string;
  documentId: string;
  saveUrl: string;
  sessionId: string;
  sessionDeleteUrl: string;
  documentDeleteUrl: string;
  keyModified: {}; // ?
}

interface ICreateDocumentParams {
  user_id: string;
  filename: string;
}

async function createDocument(params: ICreateDocumentParams) {
  return axios.get<ICreateDocumentResponse>(
    "http://localhost:3001/zoho/create",
    {
      params,
    },
  );
}

export default function Preview() {
  const params = useParams();

  const { loggedInAs, setLoggedInAs } = useLoggedInAs();
  const userId = loggedInAs?.id;

  const [src, setSrc] = useState<string>();

  const filename = params.filename;

  const shouldCreateDoc = !!filename?.length && !!userId;

  const { data, ...restQuery } = useQuery({
    queryKey: ["create-document"],
    queryFn: () =>
      createDocument({
        user_id: String(userId!),
        filename: filename as string,
      }),
    enabled: shouldCreateDoc,
  });

  useEffect(() => {
    const { documentUrl } = data?.data ?? {};

    if (!documentUrl) return;

    setSrc(documentUrl);
  }, [data]);

  console.log({ data, ...restQuery });

  if (!shouldCreateDoc) return <div>No filename provided or not logged in</div>;

  return (
    <main className="flex min-h-screen max-h-screen overflow-hidden flex-col items-center">
      {inspect(data?.data) ?? "Loading..."}
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
