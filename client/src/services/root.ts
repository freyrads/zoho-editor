import { IGetUsersResponse } from "@/interfaces/api";
import axios from "axios";

export function getUsers(): Promise<{
  data: IGetUsersResponse[];
}> {
  return axios.get("http://localhost:3001/users");
}
