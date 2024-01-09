import { IDocType } from "@/interfaces/api";

export function isValidDocType(docType: any): docType is IDocType {
  return ["sheet", "writer"].includes(docType);
}
