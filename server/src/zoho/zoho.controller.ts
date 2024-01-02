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
  Response,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AppService } from 'src/app.service';
import { CreateDocument, PreviewDocument } from 'src/libs/zoho';
import * as express from 'express';
import EditDocument from 'src/libs/zoho/EditDocument';

function createNewZohoDocId() {
  return '' + new Date().getTime();
}

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
    @Query('document_id') document_id: string,
  ): Promise<IGetPreviewResponse> {
    const docId = document_id?.length ? parseInt(document_id) : NaN;
    if (Number.isNaN(docId)) {
      console.error({ document_id });
      throw new HttpException('Invalid document_id', HttpStatus.BAD_REQUEST);
    }

    const cached = previewCache.get(document_id);

    if (cached) {
      return cached;
    }

    // TODO: find from db first if document already has session exist
    const savedDoc = await this.appService.getDocumentById(docId);

    if (!savedDoc) {
      console.error('Not found: document_id:', document_id);
      throw new HttpException('Unknown Document', HttpStatus.NOT_FOUND);
    }

    // if not in db, create new zoho session
    const res = await PreviewDocument.execute({ filename: savedDoc.filename });
    console.log({ res });

    // save session to cache and db(TODO)
    previewCache.set(document_id, res);

    return res;
  }

  @Get('create')
  async getCreate(
    @Response() response: express.Response,
    @Query('user_id') user_id: string,
    @Query('filename')
    filename?: string,
  ): Promise<IGetCreateResponse> {
    const uid = user_id?.length ? parseInt(user_id) : NaN;
    if (Number.isNaN(uid)) {
      console.error({ user_id });
      throw new HttpException('Invalid user_id', HttpStatus.BAD_REQUEST);
    }

    const user = await this.appService.getUserById(uid);
    if (!user) {
      console.error({ user });
      throw new HttpException('Invalid user', HttpStatus.UNAUTHORIZED);
    }

    const oriFname = filename;

    filename = filename
      ? decodeURIComponent(filename)
      : `Untitled-${new Date().valueOf()}.docx`;

    console.log({ filename: oriFname, sanitizedFilename: filename });

    if (!oriFname) {
      return response.redirect(`/create/${filename}`) as any;
    }

    const userName = user.name;
    const documentId = createNewZohoDocId();

    const res: IGetCreateResponse = await CreateDocument.execute({
      documentId,
      userName,
      userId: String(user.id),
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

  // @Get('edit')
  // async getCreate(@Param() params: any): Promise<> {
  // }

  // preview endpoint
  @Get('edit')
  async getEdit(
    @Query('user_id') user_id: string,
    @Query('document_id')
    document_id: string,
  ): Promise<IGetPreviewResponse> {
    const uid = user_id?.length ? parseInt(user_id) : NaN;
    if (Number.isNaN(uid)) {
      console.error({ user_id });
      throw new HttpException('Invalid user_id', HttpStatus.BAD_REQUEST);
    }

    const docId = document_id?.length ? parseInt(document_id) : NaN;
    if (Number.isNaN(docId)) {
      console.error({ document_id });
      throw new HttpException('Invalid document_id', HttpStatus.BAD_REQUEST);
    }

    const user = await this.appService.getUserById(uid);
    if (!user) {
      console.error({ user });
      throw new HttpException('Invalid user', HttpStatus.UNAUTHORIZED);
    }

    const savedDoc = await this.appService.getDocumentById(docId);

    if (!savedDoc)
      throw new HttpException('Unknown Document', HttpStatus.NOT_FOUND);

    // const cached = previewCache.get(filename);

    // if (cached) {
    //   return cached;
    // }

    // TODO: find from db first if document already has session exist

    if (!savedDoc.zoho_document_id) {
      savedDoc.zoho_document_id = createNewZohoDocId();

      await this.appService.updateZohoDocId(
        savedDoc.id,
        savedDoc.zoho_document_id,
      );
    }

    // if not in db, create new zoho session
    const res = await EditDocument.execute({
      filename: savedDoc.filename,
      documentId: savedDoc.zoho_document_id,
      userId: String(user.id),
      userName: user.name,
    });
    console.log({ res });

    // save session to cache and db(TODO)
    // previewCache.set(filename, res);

    return res;
  }

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
      const auid = !!body?.author_id?.length ? parseInt(body.author_id) : NaN;
      if (Number.isNaN(auid)) {
        const err = new HttpException(
          'Invalid author_id',
          HttpStatus.BAD_REQUEST,
        );
        console.error(err);
        throw err;
      }

      const user = await this.appService.getUserById(auid);

      console.log({ user });

      if (!user) {
        const err = new HttpException(
          'Invalid author_id',
          HttpStatus.BAD_REQUEST,
        );
        console.error(err);
        throw err;
      }

      const createdDoc = await this.appService.createDocument({
        data: {
          file_data: JSON.stringify(content),
          zoho_document_id: params.id,
          filename: content.filename,
          existing: false, //body.existing,
          author_id: user.id,
        },
      });

      console.log({ createdDoc });
    }
    // else update?
  }
}
