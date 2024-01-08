"use client";

import { getAllDocuments } from "@/services/root";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface IDoc {
  id: number;
  title: null;
  filename: string;
  is_template: boolean;
  file_data: string;
  zoho_document_id: string;
  author_id: number;
  existing: boolean;
  deleted: boolean;
  doc_type: string;
}

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

  const handleCreateMergeTemplate = (doc: IDoc) => {
    router.push(`/create-merge-template?document_id=${doc.id}`);
  };

  const handlePreview = (doc: IDoc) => {
    console.log({ doc });

    router.push(`/preview/${doc.id}`);
  };

  const handleEdit = (doc: IDoc) => {
    console.log({ doc });

    router.push(`/edit/${doc.id}`);
  };

  const handleDelete = (doc: IDoc) => {
    console.log({ doc });
  };

  const handleMergeWithData = (doc: IDoc) => {
    console.log(doc);

    router.push(`/merge-template/${doc.id}`);
  };

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
        {docList.map((doc: IDoc) => {
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
                    onClick={() => handleCreateMergeTemplate(doc)}
                  >
                    Create merge template
                  </button>
                  <button
                    className="btn-look"
                    onClick={() => handleDelete(doc)}
                  >
                    Delete
                  </button>
                  {doc.is_template && (
                    <button
                      className="btn-look"
                      onClick={() => handleMergeWithData(doc)}
                    >
                      Merge with data
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
