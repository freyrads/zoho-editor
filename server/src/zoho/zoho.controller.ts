import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
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
    @Query('filename') filename?: string,
  ): Promise<IGetPreviewResponse> {
    console.log({ filename });

    if (!filename || !/^[a-zA-Z0-9-_ ]+\.docx$/.test(filename))
      throw new HttpException('Invalid filename', HttpStatus.BAD_REQUEST);

    const cached = previewCache.get(filename);

    if (cached) {
      return cached;
    }

    // TODO: find from db first if document already has session exist

    // if not in db, create new zoho session
    const res = await PreviewDocument.execute({ filename });
    console.log({ res });

    // save session to cache and db(TODO)
    previewCache.set(filename, res);

    return res;
  }

  @Get('create')
  async getCreate(
    @Query('user_id') user_id: string,
    @Query('filename')
    filename: string = `Untitled-${new Date().valueOf()}.docx`,
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
      filename,
    });

    console.log({ res });

    // save to db
    await this.appService.createZohoSession({
      data: {
        user_id: uid,
        zoho_document_id: res.documentId,
        session_data: JSON.stringify(res),
        session_type: 'create',
        session_id: res.sessionId,
      },
    });

    return res;
  }

  // @Get('delete')
  // async getCreate(@Param() params: any): Promise<> {
  // }

  // @Get('edit')
  // async getCreate(@Param() params: any): Promise<> {
  // }

  @Post(':id/save')
  @UseInterceptors(
    FileInterceptor('content', {
      storage: diskStorage({
        destination: process.env.DOCUMENT_FOLDER,
        filename: (req, file, cb) => {
          console.log({ req, file });

          cb(null, file.originalname);
        },
      }),
    }),
  )
  async postDocumentSave(
    @Param() params: any,
    @Body() body: any,
    @Query() queries: any,
    @Headers() headers: any,
    @UploadedFile() content: Express.Multer.File,
  ) {
    console.log('POST :id/save:');
    console.log({ params, body, queries, headers, content });
    /*
POST :id/save:                                                                                  
{                                       
  params: { id: '1703822085550' },                                                              
  body: [Object: null prototype] {                                                                                                                                                              
    filename: 'test2',                                                                          
    id: '123131',                                                                               
    auth_token: '1234'                
    TODO: add actual info fields here
  },                                                                                            
  queries: {},                              
  headers: {                                                                                    
    'req-mi-chain': '-1407389072:8080',
    header2: 'value2',                                                                          
    header1: 'value1',                                                                                                                                                                          
    'content-type': 'multipart/form-data; charset=UTF-8; boundary=MultiPartFileBoundary18cb3d7987d',                                                                                            
    'user-agent': 'Java/11.0.20',                                                                                                                                                               
    accept: 'text/html, image/gif, image/jpeg, *; q=.2, *\/*; q=.2',                             
    'content-length': '101709',                                                                 
    host: '149.102.255.134',                                                                    
    'x-forwarded-for': 'unknown',
    'cache-control': 'max-age=259200',
    connection: 'keep-alive'
  },
  content: {
    fieldname: 'content',
    originalname: 'New Document: 1703822085550.docx',
    encoding: '7bit',
    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    destination: './docs/',
    filename: 'New Document: 1703822085550.docx',
    path: 'docs/New Document: 1703822085550.docx',
    size: 101173
  }
}
    */

    const existingDoc = await this.appService.getDocumentByZohoDocId(params.id);

    console.log({ existingDoc });

    // TODO: update/insert document entry in db
    if (!existingDoc) {
      const createdDoc = await this.appService.createDocument({
        data: {
          zoho_document_id: params.id,
          filename: content.filename,
          existing: body.existing,
          author_id: body.author_id,
        },
      });

      console.log({ createdDoc });
    }
    // else update?
  }
}
