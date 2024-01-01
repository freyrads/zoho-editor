export interface IGetUsersResponse {
  id: number;
  name: string;
  created_documents: any[];
}

export interface IGetDocumentResponse {
  previewUrl: string;
  sessionId: string;
  sessionDeleteUrl: string;
  documentDeleteUrl: string;
  keyModified: {}; //?
}

export interface IGetDocumentParams {
  filename: string;
}

export interface ICreateDocumentResponse {
  documentUrl: string;
  documentId: string;
  saveUrl: string;
  sessionId: string;
  sessionDeleteUrl: string;
  documentDeleteUrl: string;
  keyModified: {}; // ?
}

export interface ICreateDocumentParams {
  user_id: string;
  // unused
  filename?: string;
}

export type IGetAllDocumentResponse = any;
// export interface IGetAllDocumentResponse {}

export type IGetAllSessionResponse = any;
// export interface IGetAllSessionResponse {}
