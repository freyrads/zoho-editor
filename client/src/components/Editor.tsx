"use client";

import { IEditorProps } from "@/interfaces/components";
import { useEffect } from "react";
import { inspect } from "util";

export function Editor({ data, src, id }: Readonly<IEditorProps>) {
  // min-w-screen max-w-screen is not working
  //

  const editorId = `zoho-editor-${id}`;

  useEffect(() => {
    console.log({ xdc: (window as any).XDC });
    if (!(window as any).XDC) return;

    (window as any).XDC.setTarget({
      origin: "https://api.office-integrator.com",
      window: (document.getElementById(editorId) as HTMLIFrameElement)
        ?.contentWindow,
    });
  }, []);

  return (
    <main className="flex min-h-screen max-h-screen min-w-[100vw] max-w-[100vw] overflow-auto flex-col items-center">
      <div className="break-all">{data ? inspect(data) : "Loading..."}</div>
      <div className="flex w-full">
        <iframe
          id={editorId}
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
