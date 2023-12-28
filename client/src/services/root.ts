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
  return axios.get("http://localhost:3001/users");
}

export async function getDocument(params: IGetDocumentParams) {
  return axios.get<IGetDocumentResponse>("http://localhost:3001/zoho/preview", {
    params,
  });
}
export async function createDocument(params: ICreateDocumentParams) {
  return axios.get<ICreateDocumentResponse>(
    "http://localhost:3001/zoho/create",
    {
      params,
    },
  );
}
