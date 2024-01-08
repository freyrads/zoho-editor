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

export interface IApiMergeTemplateWithDataParams {
  filename: string;
  /*
   * JSON string
   */
  mergeData: string;
}

export interface IPostMergeTemplateBody {
  merge_filename: string;
  document_id: string;
  merge_data: string;
  author_id: string;
}

export interface ICallApiEditOptions {
  editParams: IEditDocumentParams;
  type?: 'sheet' | 'writer';
}
