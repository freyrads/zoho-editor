export interface ILinkMapEntry {
  href: string;
  desc: string;
}

export interface ILinkMapProps {
  links: ILinkMapEntry[];
}

export interface IEditorSaveButtonSaveUrlParams {
  author_id: string;
  doc_type?: "sheet" | "writer";
  is_merge_template?: "1";
}

export interface IBaseEditorSaveButtonOptions {
  hideSaveButton?: boolean;
  forceSave?: boolean;
  format?: string;
  onSaveError?: (data?: any) => void;
}

interface IEditorSaveButtonRequiredUrlParamsOptions
  extends IBaseEditorSaveButtonOptions {
  saveUrlParams: IEditorSaveButtonSaveUrlParams;
  hide?: boolean;
}

interface IEditorSaveButtonHiddenOptions extends IBaseEditorSaveButtonOptions {
  saveUrlParams?: IEditorSaveButtonSaveUrlParams;
  hide: true;
}

export type IEditorSaveButtonOptions =
  | IEditorSaveButtonRequiredUrlParamsOptions
  | IEditorSaveButtonHiddenOptions;

export interface IEditorProps {
  data?: any;
  src?: string;
  id?: string;
  saveButtonOptions?: IEditorSaveButtonOptions;
}
