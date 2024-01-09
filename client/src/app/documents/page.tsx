"use client";

import { getAllDocuments, postDeleteDocument } from "@/services/root";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { IDoc } from "@/interfaces/api";
import useLoggedInAs from "@/hooks/useLoggedInAs";

export default function Documents() {
  const router = useRouter();
  const { loggedInAs } = useLoggedInAs();
  console.log({ loggedInAs });
  const userId = loggedInAs?.id;

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

  const execDelete = async (id: number) => {
    if (typeof userId !== "number") return;
    const deleteRes = await postDeleteDocument({
      user_id: String(userId),
      document_id: id,
    });

    console.log({ deleteRes });
  };

  const handleDelete = (doc: IDoc) => {
    console.log({ doc });
    execDelete(doc.id);
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
                  {typeof userId === "number" && doc.author_id === userId && (
                    <button
                      className="btn-look"
                      onClick={() => handleDelete(doc)}
                    >
                      Delete
                    </button>
                  )}
                  {doc.doc_type === "sheet" && doc.is_template && (
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
