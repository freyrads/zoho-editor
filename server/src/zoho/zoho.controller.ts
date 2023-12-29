import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { AppService } from 'src/app.service';
import { CreateDocument, PreviewDocument } from 'src/libs/zoho';

interface IGetPreviewResponse {
  previewUrl: string;
  sessionId: string;
  sessionDeleteUrl: string;
  documentDeleteUrl: string;
  keyModified: {}; //?
}

interface IGetCreateResponse {
  documentUrl: string;
  documentId: string;
  saveUrl: string;
  sessionId: string;
  sessionDeleteUrl: string;
  documentDeleteUrl: string;
  keyModified: {}; // ?
}

const previewCache = new Map<string, IGetPreviewResponse>();

@Controller('zoho')
export class ZohoController {
  constructor(private readonly appService: AppService) {}

  // preview endpoint
  @Get('preview')
  async getPreview(
    @Param('filename') filename?: string,
  ): Promise<IGetPreviewResponse> {
    console.log({ filename });

    if (!filename || !/^[a-zA-Z0-9-_ ]+\.docx$/.test(filename))
      throw new HttpException('Invalid filename', HttpStatus.BAD_REQUEST);

    const cached = previewCache.get(filename);

    if (cached) {
      return cached;
    }

    // find from db first

    // if not in db, create new zoho session
    const res = await PreviewDocument.execute({ filename });
    console.log({ res });

    // save session to cache and db(TODO)
    previewCache.set(filename, res);

    return res;
  }

  @Get('create')
  async getCreate(
    @Param('user_id') user_id: string,
  ): Promise<IGetCreateResponse> {
    const uid = user_id?.length ? parseInt(user_id) : NaN;
    if (Number.isNaN(uid)) {
      console.error({ user_id });
      throw new HttpException('Invalid user_id', HttpStatus.BAD_REQUEST);
    }

    const user = await this.appService.getUserById(uid);
    if (!user) {
      console.error({ user });
      throw new HttpException('Unknown user_id', HttpStatus.UNAUTHORIZED);
    }

    const userName = user.name;
    const documentId = '' + new Date().getTime();

    const res: IGetCreateResponse = await CreateDocument.execute({
      documentId,
      userName,
      userId: String(uid),
    });

    console.log({ res });

    // save to db
    // await this.appService.createZohoSession({
    //   data: {
    //     author_id: uid,
    // zoho_document_id: res.documentId,

    //   }
    // });

    return res;
  }

  // @Get('delete')
  // async getCreate(@Param() params: any): Promise<> {
  // }

  // @Get('edit')
  // async getCreate(@Param() params: any): Promise<> {
  // }
}
