export function isValidDocType(docType: any): docType is "sheet" | "writer" {
  return ["sheet", "writer"].includes(docType);
}
