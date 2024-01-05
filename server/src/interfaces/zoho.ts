export type IZohoSessionType = 'create' | 'edit'; // | 'delete' | 'preview';

export interface ICreateDocumentParams {
  userName: string;
  documentId: string;
  userId: string;
  filename: string;
}

export interface ICreateMergeTemplateDocumentParams {
  userName: string;
  documentId: string;
  userId: string;
  filename: string;
  /*
   * JSON string
   */
  // mergeContent: string;
  // mergeContentName: string;
  newFilename: string;
  inTemplateFolder?: boolean;
  // mergeFilename: string;
}

export interface ICallApiCreateOptions {
  type?: 'sheet' | 'writer';
  isMergeTemplate?: boolean;
  createParams: ICreateDocumentParams | ICreateMergeTemplateDocumentParams;
}

export interface IEditDocumentParams {
  userName: string;
  documentId: string;
  userId: string;
  filename: string;

  showFileMenu?: boolean;
}
