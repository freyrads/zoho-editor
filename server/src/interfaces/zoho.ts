export type IZohoSessionType = 'create' | 'edit'; // | 'delete' | 'preview';

export interface IApiCreateSpreadSheetParams {
  authorId: number;
  userName: string;
  documentName: string;
}
