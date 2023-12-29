import { API_URL } from "@/config";
import {
  ICreateDocumentParams,
  ICreateDocumentResponse,
  IGetDocumentParams,
  IGetDocumentResponse,
  IGetUsersResponse,
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
