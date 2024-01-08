"use client";

import useLoggedInAs from "@/hooks/useLoggedInAs";
import { getMergeJsonSample, postZohoMergeTemplate } from "@/services/root";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export function MergeTemplate() {
  const params = useParams();
  const [jsonData, setJsonData] = useState("");
  const [filename, setFilename] = useState("");
  const [dis, setDis] = useState(false);

  const { loggedInAs } = useLoggedInAs();
  console.log(loggedInAs);
  const userId = loggedInAs?.id;

  const getJsonData = async () => {
    const res = await getMergeJsonSample();

    setJsonData(JSON.stringify(res, null, 2));
  };

  useEffect(() => {
    getJsonData();
  }, []);

  const idStr = params.id;
  if (typeof idStr !== "string") return <h1>Invalid ID</h1>;

  const id = idStr.length ? parseInt(idStr) : NaN;

  if (Number.isNaN(id)) return <h1>Invalid ID</h1>;

  const handleJsonChange: React.ComponentProps<"textarea">["onChange"] = (
    e,
  ) => {
    e.preventDefault();
    setJsonData(e.target.value);
  };

  const execMerge = async () => {
    const res = await postZohoMergeTemplate({
      merge_data: jsonData,
      merge_filename: filename,
      document_id: String(id),
      author_id: String(userId),
    });

    console.log({ res });
  };

  const handleGo = () => {
    if (!filename.length) return;

    try {
      JSON.parse(jsonData);
    } catch (e) {
      console.error(e);
      return;
    }

    setDis(true);

    execMerge();
  };

  return (
    <div>
      <div>
        <h1>JSON Data:</h1>
        <textarea value={jsonData} onChange={handleJsonChange} />
      </div>

      <input
        className="btn-look"
        value={filename}
        onChange={(e) => setFilename(e.target.value)}
      />

      <button disabled={dis} className="btn-look" onClick={handleGo}>
        Merge
      </button>
    </div>
  );
}
