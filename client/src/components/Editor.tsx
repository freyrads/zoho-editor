"use client";

import { IEditorProps } from "@/interfaces/components";
import { inspect } from "util";
import { useEffect } from "react";

export function Editor({
  data,
  src,
  id,
  saveButtonOptions = {},
}: Readonly<IEditorProps>) {
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

  const handleSaveManually = () => {
    if ((window as any).XDC) return;

    const { hideSaveButton, forceSave, saveUrlParams, format, onSaveError } =
      saveButtonOptions;

    (window as any).XDC.postMessage({
      message: "SaveDocument",
      data: {
        hideSaveButton: hideSaveButton ?? false, // Default value will be true
        forceSave: forceSave ?? true, // Default value will be true
        saveUrlParams: saveUrlParams,
        format: format,
      },
      // Use "SaveDocumentResponse" event for oncomplete
      onexception: function (data: any) {
        // Handle exception
        console.error({ data });
        onSaveError?.(data);
      },
    });
  };

  return (
    <main className="flex min-h-screen max-h-screen min-w-[100vw] max-w-[100vw] overflow-auto flex-col items-center">
      <div className="break-all">{data ? inspect(data) : "Loading..."}</div>
      <div>
        <button className="btn-look" onClick={handleSaveManually}>
          Save Manually
        </button>
      </div>
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
