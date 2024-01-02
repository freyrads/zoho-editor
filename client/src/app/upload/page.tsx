"use client";

import { API_URL } from "@/config";
import useLoggedInAs from "@/hooks/useLoggedInAs";
import { postDocuments } from "@/services/root";
import { useRouter } from "next/navigation";

export default function Upload() {
  const postUrl = `${API_URL}/documents`;
  console.log({ postUrl });

  const router = useRouter();

  const { loggedInAs } = useLoggedInAs();

  console.log({ loggedInAs });

  const doPostDocuments = async (e: FormData) => {
    try {
      const res = await postDocuments(e);
      console.log(res);

      router.push("/documents");
    } catch (e) {
      console.error(e);
    }
  };

  const handleFormAction: React.ComponentProps<"form">["action"] = (e) => {
    console.log(e);

    doPostDocuments(e);
  };

  return (
    <form
      className=""
      encType="multipart/form-data"
      method="post"
      action={handleFormAction}
    >
      <div>UPLOAD</div>

      <div className="flex flex-col gap-[20px]">
        <input type="number" name="author_id" value={loggedInAs?.id} hidden />

        <input
          name="file"
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          // .doc,,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document
        />

        <button>Submit</button>
      </div>
    </form>
  );
}
