"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Preview() {
  const [filename, setFilename] = useState<string>();
  const router = useRouter();
  const [isSheet, setIsSheet] = useState(false);

  const handleGo = () => {
    router.push(`/create/${filename}?type=${isSheet ? "sheet" : "writer"}`);
  };

  const toggleIsSheet = () => {
    setIsSheet((v) => !v);
  };

  return (
    <div className="flex flex-col">
      <div className="flex">
        <label htmlFor="spreadsheet">Spreadsheet:</label>
        <input
          id="spreadsheet"
          type="checkbox"
          checked={isSheet}
          onChange={toggleIsSheet}
        />
      </div>

      <div className="flex">
        <input
          className="btn-look"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
        />
        <button className="btn-look" onClick={handleGo}>
          Go Create
        </button>
      </div>
    </div>
  );
}
