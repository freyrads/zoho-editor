import { Controller, Get, Param } from '@nestjs/common';
import { PreviewDocument } from 'src/libs/zoho';

interface IGetOneResponse {
  preview_url: string;
  session_id: string;
  document_id: string;
  session_delete_url: string;
  document_delete_url: string;
}

@Controller('zoho')
export class ZohoController {
  // preview endpoint
  @Get('preview')
  async getPreview(@Param() params: any): Promise<IGetOneResponse> {
    const res = await PreviewDocument.execute();
    console.log({ res });

    return res;
  }

  // @Get('create')
  // async getCreate(@Param() params: any): Promise<> {
  // }

  // @Get('delete')
  // async getCreate(@Param() params: any): Promise<> {
  // }

  // @Get('edit')
  // async getCreate(@Param() params: any): Promise<> {
  // }
}
