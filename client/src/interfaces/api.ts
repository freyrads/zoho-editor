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

  preview_url?: string;
}

export interface IGetDocumentParams {
  document_id: string;
}

export interface ICreateDocumentResponse {
  documentUrl: string;
  documentId: string;
  saveUrl: string;
  sessionId: string;
  sessionDeleteUrl: string;
  documentDeleteUrl: string;
  keyModified: {}; // ?

  gridview_url?: string;
  document_url?: string;
}

export type IDocType = "sheet" | "writer";

export interface ICreateDocumentParams {
  user_id: string;
  filename?: string;

  is_merge_template?: boolean;
  merge_document_id?: number;

  type?: IDocType;
}

export interface IGetAllDocumentResponse {
  id: number;
  title: null;
  filename: string;
  is_template: boolean;
  /**
   * JSON string
   */
  file_data: string; //"{\"fieldname\":\"content\",\"originalname\":\"test doc 1.zdoc\",\"encoding\":\"7bit\",\"mimetype\":\"text/plain\",\"destination\":\"./docs/\",\"filename\":\"test doc 1.zdoc\",\"path\":\"docs/test doc 1.zdoc\",\"size\":4521}",
  zoho_document_id: string;
  author_id: number;
  existing: boolean;
  deleted: boolean;
  doc_type: IDocType;
}

export interface IGetAllSessionResponse {
  id: number;
  document_id: string | null;
  user_id: number;
  zoho_document_id: string | null;
  /*
   * JSON string
   */
  session_data: string; //"{\"documentUrl\":\"https://api.office-integrator.com/writer/officeapi/v1/documents/8fcde05f0f2854835155ea0da39d3ab44a75119112d21a9ece4393aafc68c89a4ecb5ff0a2d85c4be52611fc44c0ac998e8650bf58e029153e92de5764429f794928122a1432ec4ec809cde72e0453cce45a32865f6a81fb939e3ce8fd5e80cc/edit\",\"documentId\":\"1704164229723\",\"saveUrl\":\"https://api.office-integrator.com/writer/officeapi/v1/documents/8fcde05f0f2854835155ea0da39d3ab44a75119112d21a9ece4393aafc68c89a4ecb5ff0a2d85c4be52611fc44c0ac998e8650bf58e029153e92de5764429f794928122a1432ec4ec809cde72e0453cce45a32865f6a81fb939e3ce8fd5e80cc/save\",\"sessionId\":\"8fcde05f0f2854835155ea0da39d3ab44a75119112d21a9ece4393aafc68c89a4ecb5ff0a2d85c4be52611fc44c0ac998e8650bf58e029153e92de5764429f794928122a1432ec4ec809cde72e0453cce45a32865f6a81fb939e3ce8fd5e80cc\",\"sessionDeleteUrl\":\"https://api.office-integrator.com/writer/officeapi/v1/sessions/8fcde05f0f2854835155ea0da39d3ab44a75119112d21a9ece4393aafc68c89a4ecb5ff0a2d85c4be52611fc44c0ac998e8650bf58e029153e92de5764429f794928122a1432ec4ec809cde72e0453cce45a32865f6a81fb939e3ce8fd5e80cc\",\"documentDeleteUrl\":\"https://api.office-integrator.com/writer/officeapi/v1/documents/1704164229723\",\"keyModified\":{}}",
  session_type: "create" | "edit";
  session_id: string;
  deleted: boolean;
  joined_session_id: number | null;
  // TODO: incomplete fields
}

export interface IEditDocumentParams {
  user_id: string;
  document_id?: string;
}

export type IEditDocumentResponse = any;

export interface IPostZohoMergeTemplateData {
  merge_filename: string;
  document_id: string;
  merge_data: string;
  author_id: string;
}

export interface IDoc {
  id: number;
  title: null;
  filename: string;
  is_template: boolean;
  file_data: string;
  zoho_document_id: string;
  author_id: number;
  existing: boolean;
  deleted: boolean;
  doc_type: string;
}
