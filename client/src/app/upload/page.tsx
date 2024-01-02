"use client";

import { API_URL } from "@/config";
import useLoggedInAs from "@/hooks/useLoggedInAs";

export default function Upload() {
  const postUrl = `${API_URL}/documents`;
  console.log({ postUrl });

  const { loggedInAs } = useLoggedInAs();

  console.log({ loggedInAs });

  return (
    <form
      className=""
      encType="multipart/form-data"
      method="post"
      action={postUrl}
    >
      <div>UPLOAD</div>

      <input type="number" name="author_id" value={loggedInAs?.id} hidden />

      <input
        name="file"
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        // .doc,,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document
      />

      <button>Submit</button>
    </form>
  );
}
