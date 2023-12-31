import { API_URL } from "@/config";
import {
  ICreateDocumentParams,
  ICreateDocumentResponse,
  IDoc,
  IEditDocumentParams,
  IEditDocumentResponse,
  IGetAllDocumentResponse,
  IGetAllSessionResponse,
  IGetDocumentParams,
  IGetDocumentResponse,
  IGetUsersResponse,
  IPostZohoMergeTemplateData,
} from "@/interfaces/api";
import axios from "axios";

export async function getUsers(): Promise<{
  data: IGetUsersResponse[];
}> {
  return axios.get(`${API_URL}/users`);
}

export async function getDocument(params: IGetDocumentParams) {
  return axios.get<IGetDocumentResponse>(`${API_URL}/zoho/preview`, {
    params,
  });
}

export async function createDocument(params: ICreateDocumentParams) {
  return axios.get<ICreateDocumentResponse>(`${API_URL}/zoho/create`, {
    params,
  });
}

export async function getAllDocuments() {
  return axios.get<IGetAllDocumentResponse[]>(`${API_URL}/documents`);
}

export async function getAllSessions() {
  return axios.get<IGetAllSessionResponse[]>(`${API_URL}/sessions`);
}

export async function postDocuments(data: FormData, isMergeTemplate?: boolean) {
  console.log({ data, isMergeTemplate });

  const endpoint = isMergeTemplate ? "template-documents" : "documents";

  return axios.post<IGetAllSessionResponse>(`${API_URL}/${endpoint}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function editDocument(params: IEditDocumentParams) {
  return axios.get<IEditDocumentResponse>(`${API_URL}/zoho/edit`, {
    params,
  });
}

export async function postZohoMergeTemplate(data: IPostZohoMergeTemplateData) {
  return axios.post<void>(`${API_URL}/zoho/merge-template`, data);
}

export async function getMergeJsonSample() {
  return axios.get<object>(`${API_URL}/merge-json-example`);
}

export async function postDeleteDocument({
  document_id,
  user_id,
}: {
  document_id: number;
  user_id: string;
}) {
  return axios.post<{
    deletedDocument: IDoc[];
    deletedDocumentURLs: string[];
    deletedSessions: any;
  }>(`${API_URL}/zoho/documents/${document_id}/delete`, {
    user_id,
  });
}
