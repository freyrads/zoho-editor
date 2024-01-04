import { IEditorProps } from "@/interfaces/components";
import { inspect } from "util";

export function Editor({ data, src }: Readonly<IEditorProps>) {
  // min-w-screen max-w-screen is not working
  //
  return (
    <main className="flex min-h-screen max-h-screen min-w-[100vw] max-w-[100vw] overflow-auto flex-col items-center">
      <div className="break-all">{data ? inspect(data) : "Loading..."}</div>
      <div className="flex w-full">
        <iframe
          name="preview-iframe"
          width="100%"
          style={{
            height: "100vh",
          }}
          src={src}
        ></iframe>
      </div>
    </main>
  );
}
