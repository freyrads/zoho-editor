"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Preview() {
  const [filename, setFilename] = useState<string>();
  const router = useRouter();
  const queryParams = useSearchParams();

  const document_id_str = queryParams.get("document_id");

  const document_id = document_id_str?.length ? parseInt(document_id_str) : NaN;

  if (Number.isNaN(document_id)) return <h1>Invalid document_id</h1>;

  const handleGo = () => {
    router.push(`/create-merge-template/${document_id}/${filename}`);
  };

  return (
    <div>
      <input
        className="btn-look"
        value={filename}
        onChange={(e) => setFilename(e.target.value)}
      />
      <button className="btn-look" onClick={handleGo}>
        Go Create
      </button>
    </div>
  );
}
