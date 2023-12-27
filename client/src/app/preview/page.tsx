"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { inspect } from "util";

interface IGetDocumentResponse {
  previewUrl: string;
  sessionId: string;
  sessionDeleteUrl: string;
  documentDeleteUrl: string;
  keyModified: {}; //?
}

async function getDocument(): Promise<{
  data: IGetDocumentResponse;
}> {
  return axios.get("http://localhost:3001/zoho/preview");
}

export default function Preview() {
  const [previewSrc, setPreviewSrc] = useState<string>();

  const { data, ...restQuery } = useQuery({
    queryKey: ["get-document"],
    queryFn: getDocument,
  });

  useEffect(() => {
    const { previewUrl } = data?.data || {};

    if (!previewUrl) return;

    setPreviewSrc(previewUrl);
  }, [data]);

  console.log({ data, ...restQuery });

  return (
    <main className="flex min-h-screen max-h-screen overflow-hidden flex-col items-center">
      {inspect(data?.data) ?? "Loading..."}
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
