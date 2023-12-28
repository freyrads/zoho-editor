import { Controller, Get, Param } from '@nestjs/common';
import { CreateDocument, PreviewDocument } from 'src/libs/zoho';

interface IGetPreviewResponse {
  preview_url: string;
  session_id: string;
  document_id: string;
  session_delete_url: string;
  document_delete_url: string;
}

interface IGetCreateResponse {}

@Controller('zoho')
export class ZohoController {
  // preview endpoint
  @Get('preview')
  async getPreview(
    @Param('filename') filename?: string,
    @Param('zoho_doc_id') zoho_doc_id?: string,
  ): Promise<IGetPreviewResponse> {
    const res = await PreviewDocument.execute();
    console.log({ res });

    return res;
  }

  @Get('create')
  async getCreate(
    @Param('filename') filename: string,
    @Param('user_id') user_id: string,
  ): Promise<IGetCreateResponse> {
    const res = await CreateDocument.execute();
    console.log({ res });

    return res;
  }

  // @Get('delete')
  // async getCreate(@Param() params: any): Promise<> {
  // }

  // @Get('edit')
  // async getCreate(@Param() params: any): Promise<> {
  // }
}
