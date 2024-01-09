"use client";

import { IEditorProps } from "@/interfaces/components";
import { inspect } from "util";
import { useEffect, useRef, useState } from "react";

export function Editor({
  data,
  src,
  id,
  saveButtonOptions = { hide: true },
  onSave,
}: Readonly<IEditorProps>) {
  // min-w-screen max-w-screen is not working
  //
  const [autosaveTimeout, setAutosaveTimeout] = useState(0);
  const shouldAutosaveRef = useRef(false);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editorId = `zoho-editor-${id}`;

  const hideSaveManuallyButton = saveButtonOptions.hide;

  const saveDocument = () => {
    if (!(window as any).XDC) return;

    const { onSaveError, isSheet } = saveButtonOptions;

    if (isSheet) {
      (window as any).XDC.postMessage({
        message: "SaveSpreadsheet",
        // Use "SaveSpreadsheetResponse" event for oncomplete
        onexception: function (data: any) {
          // Handle exception
          console.error({ data });
          onSaveError?.(data);
        },
      });
      return;
    }

    const { hideSaveButton, forceSave /*saveUrlParams, format*/ } =
      saveButtonOptions;

    (window as any).XDC.postMessage({
      message: "SaveDocument",
      data: {
        hideSaveButton:
          typeof hideSaveButton === "boolean" ? hideSaveButton : false, // Default value will be true
        forceSave: typeof forceSave === "boolean" ? forceSave : true, // Default value will be true
        // saveUrlParams: saveUrlParams,
        // format: format,
      },
      // Use "SaveDocumentResponse" event for oncomplete
      onexception: function (data: any) {
        // Handle exception
        console.error({ data });
        onSaveError?.(data);
      },
    });
  };

  const autosaveTimerEnd = () => {
    if (!shouldAutosaveRef.current) return;

    saveDocument();

    shouldAutosaveRef.current = false;
  };

  const updateAutosaveSecondTimer = () => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    if (autosaveTimeout <= 0) return autosaveTimerEnd();

    setAutosaveTimeout((v) => --v);
    autosaveTimerRef.current = setTimeout(updateAutosaveSecondTimer, 1000);
  };

  const triggerAutosaveCountdown = () => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    setAutosaveTimeout(30);
    autosaveTimerRef.current = setTimeout(updateAutosaveSecondTimer, 1000);

    shouldAutosaveRef.current = true;
  };

  useEffect(() => {
    const xdc = (window as any).XDC;
    console.log({ xdc });

    if (!xdc) return;
    const iFrame = document.getElementById(editorId) as HTMLIFrameElement;

    (window as any).XDC.setTarget({
      origin: "https://api.office-integrator.com",
      window: iFrame?.contentWindow,
    });

    (window as any).XDC.receiveMessage(
      "SaveSpreadsheetResponse",
      function (data: any) {
        console.log({ SaveSpreadsheetResponse: data });
        onSave?.(data, { type: "sheet" });
      },
    );

    const { isSheet } = saveButtonOptions;

    if (isSheet) {
      (window as any).XDC.receiveMessage(
        "SpreadsheetModified",
        function (data: any) {
          console.log({ SpreadsheetModified: data });
          triggerAutosaveCountdown();
        },
      );

      (window as any).XDC.receiveMessage(
        "SaveSpreadsheetResponse",
        function (data: any) {
          console.log({ SaveSpreadsheetResponse: data });
          onSave?.(data, { type: "sheet" });
        },
      );

      return;
    }

    (window as any).XDC.receiveMessage(
      "DocumentModified",
      function (data: any) {
        console.log({ DocumentModified: data });
        triggerAutosaveCountdown();
      },
    );

    (window as any).XDC.receiveMessage(
      "SaveDocumentResponse",
      function (data: any) {
        console.log({ SaveDocumentResponse: data });
        onSave?.(data, { type: "writer" });
      },
    );
  }, []);

  const handleSaveManually = () => {
    if (hideSaveManuallyButton) return;

    saveDocument();
  };

  return (
    <main className="flex min-h-screen max-h-screen min-w-[100vw] max-w-[100vw] overflow-auto flex-col items-center">
      <div className="break-all">{data ? inspect(data) : "Loading..."}</div>
      <div className="flex justify-center items-center gap-[20px]">
        <div className="flex justify-center items-center">
          Saving automatically in: {autosaveTimeout} second.
        </div>
        {!hideSaveManuallyButton && (
          <button className="btn-look" onClick={handleSaveManually}>
            Save Manually
          </button>
        )}
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
