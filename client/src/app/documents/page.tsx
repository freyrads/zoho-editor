"use client";

import { getAllDocuments } from "@/services/root";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function Documents() {
  const router = useRouter();

  const { data } = useQuery({
    queryFn: getAllDocuments,
    queryKey: ["get-all-documents"],
  });

  const docList = data?.data ?? [];

  console.log({ docList });

  const handleUpload = () => {
    router.push("/upload");
  };

  const handleCreate = () => {
    router.push("/create");
  };

  const handlePreview = (doc: any) => {};

  const handleEdit = (doc: any) => {};

  const handleDelete = (doc: any) => {};

  return (
    <div className="flex flex-col gap-[12px]">
      <h1>Documents List</h1>

      <div className="flex flex-col gap-[12px]">
        <button className="btn-look" onClick={handleCreate}>
          + Create
        </button>
        <button className="btn-look" onClick={handleUpload}>
          + Upload
        </button>
      </div>
      <ul className="gap-[12px] flex flex-col">
        {docList.map((doc: any) => {
          return (
            <li key={doc.id}>
              <div className="flex justify-between">
                <span className="btn-look">{doc.filename}</span>
                <div className="flex gap-[20px]">
                  <button
                    className="btn-look"
                    onClick={() => handlePreview(doc)}
                  >
                    preview
                  </button>
                  <button className="btn-look" onClick={() => handleEdit(doc)}>
                    edit
                  </button>
                  <button
                    className="btn-look"
                    onClick={() => handleDelete(doc)}
                  >
                    delete
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
