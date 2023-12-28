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

const previewCache = new Map<string, IGetPreviewResponse>();

@Controller('zoho')
export class ZohoController {
  // preview endpoint
  @Get('preview')
  async getPreview(
    @Param('filename') filename?: string,
  ): Promise<IGetPreviewResponse> {
    console.log({ filename });

    if (!filename || !/^[a-zA-Z0-9-_ ]+\.docx$/.test(filename))
      throw new Error('Invalid filename');

    const cached = previewCache.get(filename);

    if (cached) {
      return cached;
    }

    // find from db first

    // if not in db, create new zoho session
    const res = await PreviewDocument.execute({ filename });
    console.log({ res });

    // save session?

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
