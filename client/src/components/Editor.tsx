"use client";

import { IEditorOnSaveInfo, IEditorProps } from "@/interfaces/components";
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
  const [autosaveTimeout, setAutosaveTimeout] = useState(30);
  const autosaveTimeoutRef = useRef(30);
  const shouldAutosaveRef = useRef(false);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editorId = `zoho-editor-${id}`;

  const hideSaveManuallyButton = saveButtonOptions.hide;

  const saveDocument = () => {
    if (!(window as any).XDC) return;

    const { onSaveError, isSheet } = saveButtonOptions;

    if (isSheet) {
      console.log({ savingIsSheet: saveButtonOptions });
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

    console.log({ savingIsWriter: saveButtonOptions });

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
  };

  const updateAutosaveSecondTimer = () => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    console.log({
      currentSec: autosaveTimeoutRef.current,
      shouldSave: shouldAutosaveRef.current,
    });

    if (autosaveTimeoutRef.current <= 0) return autosaveTimerEnd();

    autosaveTimeoutRef.current--;
    setAutosaveTimeout(autosaveTimeoutRef.current);

    autosaveTimerRef.current = setTimeout(updateAutosaveSecondTimer, 1000);
  };

  const triggerAutosaveCountdown = () => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    autosaveTimeoutRef.current = 30;
    setAutosaveTimeout(autosaveTimeoutRef.current);
    autosaveTimerRef.current = setTimeout(updateAutosaveSecondTimer, 1000);

    shouldAutosaveRef.current = true;
  };

  const handleSavedEvent = (data: any, info: IEditorOnSaveInfo) => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    autosaveTimeoutRef.current = 30;
    setAutosaveTimeout(autosaveTimeoutRef.current);

    shouldAutosaveRef.current = false;

    onSave?.(data, info);
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

    const { isSheet } = saveButtonOptions;

    console.log({ saveButtonOptions });

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
          handleSavedEvent(data, { type: "sheet" });
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
        handleSavedEvent(data, { type: "writer" });
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
          Saving automatically in:{" "}
          {shouldAutosaveRef.current ? autosaveTimeout : 0} second.
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
