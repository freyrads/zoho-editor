"use client";

import { IEditorProps } from "@/interfaces/components";
import { inspect } from "util";
import { useEffect } from "react";

export function Editor({ data, src, id }: Readonly<IEditorProps>) {
  // min-w-screen max-w-screen is not working
  //
  const editorId = `zoho-editor-${id}`;

  useEffect(() => {
    const xdc = (window as any).XDC;
    console.log({ xdc });

    if (!xdc) return;
    const iFrame = document.getElementById(editorId) as HTMLIFrameElement;

    (window as any).XDC.setTarget({
      origin: "https://api.office-integrator.com",
      window: iFrame?.contentWindow,
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
