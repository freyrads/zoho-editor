export interface ILinkMapEntry {
  href: string;
  desc: string;
}

export interface ILinkMapProps {
  links: ILinkMapEntry[];
}

export interface IEditorSaveButtonOptions {
  hideSaveButton?: boolean;
  forceSave?: boolean;
  saveUrlParams?: any;
  format?: string;
  onSaveError?: (data?: any) => void;
}

export interface IEditorProps {
  data?: any;
  src?: string;
  id?: string;
  saveButtonOptions?: IEditorSaveButtonOptions;
}
