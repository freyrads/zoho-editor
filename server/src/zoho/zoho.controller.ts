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
import {
  CreateDocument,
  PreviewDocument,
  EditDocument,
  // CoEditDocument,
  CreateMergeTemplate,
} from 'src/libs/zoho';
import * as express from 'express';
import { IZohoSessionType } from 'src/interfaces/zoho';

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

// type IGetEditResponse = any;

// const previewCache = new Map<string, IGetPreviewResponse>();
// const editCache = new Map<string, IGetEditResponse>();

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

    // const cached = previewCache.get(document_id);

    // if (cached) {
    //   return cached;
    // }

    // TODO: find from db first if document already has session exist
    const savedDoc = await this.appService.getDocumentById(docId);

    if (!savedDoc) {
      console.error('Not found: document_id:', document_id);
      throw new HttpException('Unknown Document', HttpStatus.NOT_FOUND);
    }

    // if not in db, create new zoho session
    const res = await PreviewDocument.execute({
      filename: savedDoc.filename,
      document_id: savedDoc.zoho_document_id,
    });
    console.log({ res });

    // save session to cache and db(TODO)
    // previewCache.set(document_id, res);

    return res;
  }

  @Get('create')
  async getCreate(
    @Response() response: express.Response,
    @Query('user_id') user_id: string,
    @Query('filename')
    filename?: string,
    @Query('is_merge_template')
    is_merge_template?: string,

    @Query('merge_document_id') merge_document_id?: string,
  ): Promise<void> {
    console.log({
      user_id,
      is_merge_template,
      filename,
      merge_document_id,
      // merge_filename,
    });

    const uid = user_id?.length ? parseInt(user_id) : NaN;
    if (Number.isNaN(uid)) {
      console.error({ user_id });
      throw new HttpException('Invalid user_id', HttpStatus.BAD_REQUEST);
    }

    const isMergeTemplate = ['1', 'true', 't'].includes(
      is_merge_template?.toLowerCase() as string,
    );

    let docFilename: string = createNewZohoDocId();

    if (isMergeTemplate) {
      const mergeDocumentId = merge_document_id?.length
        ? parseInt(merge_document_id)
        : NaN;

      if (Number.isNaN(mergeDocumentId)) {
        console.error({ merge_document_id: mergeDocumentId });
        throw new HttpException(
          'Invalid merge_document_id',
          HttpStatus.BAD_REQUEST,
        );
      }

      const baseDocument =
        await this.appService.getDocumentById(mergeDocumentId);

      if (!baseDocument) {
        console.error({ baseDocument });
        throw new HttpException(
          'Invalid merge_document_id',
          HttpStatus.BAD_REQUEST,
        );
      }

      docFilename = baseDocument.filename;
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

    const redirectPath = isMergeTemplate ? 'create-merge-template' : 'create';

    if (!oriFname) {
      return response.redirect(
        `/${redirectPath}/${filename}?document_id=${merge_document_id}`,
      );
    }

    const userName = user.name;
    const documentId = createNewZohoDocId();

    // const res: IGetCreateResponse = await CreateDocument.execute({
    //   documentId,
    //   userName,
    //   userId: String(user.id),
    //   filename,
    // });

    const createParams =
      // isMergeTemplate?
      {
        documentId,
        userName,
        userId: String(user.id),
        filename: isMergeTemplate ? docFilename : filename,
        /*
        {\"data\":[{\"Judul\":\"Amelia\",\"Keterangan\":\"amelia@zylker.com\",\"Deskripsi\":\"Deskripsi 1\"},{\"Judul\":\"Amelia No. 2\",\"Keterangan\":\"amelia2@zylker.com\",\"Deskripsi\":\"Deskripsi 2\"}]}
        */
        mergeContent: JSON.stringify({
          data: [
            {
              Judul: 'Amelia',
              Keterangan: 'amelia@zylker.com',
              Deskripsi: 'Deskripsi 1',
            },
            {
              Judul: 'Amelia No. 2',
              Keterangan: 'amelia2@zylker.com',
              Deskripsi: 'Deskripsi 2',
            },
            {
              Judul: 'Amelia No. 3',
              Keterangan: 'amelia3@zylker.com',
              Deskripsi: 'Deskripsi 3',
            },
            {
              Judul: 'Amelia No. 4',
              Keterangan: 'amelia4@zylker.com',
              Deskripsi: 'Deskripsi 4',
            },
          ],
        }),
        mergeContentName: 'amelia.json',
        newFilename: isMergeTemplate ? (filename as string) : '',
      };
    // : {
    //     documentId,
    //     userName,
    //     userId: String(user.id),
    //     filename,
    //   };

    const res: IGetCreateResponse = await (isMergeTemplate
      ? CreateMergeTemplate
      : CreateDocument
    ).execute(createParams);

    console.log({ res });

    const session_type: IZohoSessionType = 'create';

    // save to db
    const createdSession = await this.appService.createZohoSession({
      data: {
        user_id: uid,
        zoho_document_id: res.documentId,
        session_data: JSON.stringify(res),
        session_type,
        session_id: res.sessionId,
      },
    });

    console.log({ createdSession });

    response.json(res);
  }

  // @Get('edit')
  // async getCreate(@Param() params: any): Promise<> {
  // }

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

    // const cacheId = `${savedDoc.id}/${user.id}`;

    // const cached = editCache.get(cacheId);

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

    const session_type: IZohoSessionType = 'edit';

    // TODO: if has edit session, do co-edit?
    const existingEditSession = await this.appService.getZohoSession(
      savedDoc.zoho_document_id,
      savedDoc.id,
      session_type,
    );

    // TODO: make this a request param or something
    const shouldCoEdit = !!existingEditSession;

    const executeParams = {
      documentId: savedDoc.zoho_document_id,
      userId: String(user.id),
      userName: user.name,
      filename: savedDoc.filename,
    };

    // if not in db, create new zoho session
    const res = await (existingEditSession && shouldCoEdit
      ? // should be switched based on permission, or we can set different permission for the same edit/co-edit op
        EditDocument //CoEditDocument
      : EditDocument
    ).execute(executeParams);

    console.log({ res });

    await this.appService.createZohoSession({
      data: {
        user_id: uid,
        zoho_document_id: res.documentId,
        document_id: savedDoc.id,
        session_data: JSON.stringify(res),
        session_type,
        session_id: res.sessionId,
        joined_session_id: existingEditSession?.id,
      },
    });

    // save session to cache and db(TODO)
    // editCache.set(cacheId, res);

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
    console.log('POST :id/save: VVVVVVVVVVVVVVVVVVVV');
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
      console.log('POST :id/save: ^^^^^^^^^^^^^^^^^^^^');
      return;
    }

    // else update
    const updatedDoc = await this.appService.updateDocument({
      where: {
        id: existingDoc.id,
      },
      data: {
        file_data: JSON.stringify(content),
        // zoho_document_id: params.id,
        filename: content.filename,
      },
    });

    console.log({ updatedDoc });
    console.log('POST :id/save: ^^^^^^^^^^^^^^^^^^^^');
  }

  @Post(':id/save-merge-template')
  @UseInterceptors(
    FileInterceptor('content', {
      storage: diskStorage({
        destination: process.env.TEMPLATE_DOCUMENT_FOLDER,
        filename: (req, file, cb) => {
          console.log({ req, file });

          cb(null, file.originalname);
        },
      }),
    }),
  )
  async postMergeTemplateDocumentSave(
    @Param() params: any,
    @Body() body: any,
    @Query() queries: any,
    @Headers() headers: any,
    @UploadedFile() content: Express.Multer.File,
  ) {
    console.log('POST :id/save-merge-template: VVVVVVVVVVVVVVVVVVVV');
    console.log({ params, body, queries, headers, content });
    /*
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
          is_template: true,
        },
      });

      console.log({ createdDoc });
      console.log('POST :id/save-merge-template: ^^^^^^^^^^^^^^^^^^^^');
      return;
    }

    // else update
    const updatedDoc = await this.appService.updateDocument({
      where: {
        id: existingDoc.id,
      },
      data: {
        file_data: JSON.stringify(content),
        // zoho_document_id: params.id,
        filename: content.filename,
      },
    });

    console.log({ updatedDoc });
    console.log('POST :id/save-merge-template: ^^^^^^^^^^^^^^^^^^^^');
  }

  @Post('sessions/:id/delete')
  async postSessionDelete(@Param('id') id: string) {
    console.log('POST sessions/:id/delete:');
    console.log({ id });

    const idn = id?.length ? parseInt(id) : NaN;

    if (Number.isNaN(idn)) {
      throw new HttpException('Invalid id', HttpStatus.BAD_REQUEST);
    }

    return this.appService.deleteSessionById(idn);
  }

  @Post('documents/:id/delete')
  async postDocumentDelete(@Param('id') id: string) {
    console.log('POST documents/:id/delete:');
    console.log({ id });

    const idn = id?.length ? parseInt(id) : NaN;

    if (Number.isNaN(idn)) {
      throw new HttpException('Invalid id', HttpStatus.BAD_REQUEST);
    }

    // TODO: find document by id first to get documentDeleteUrl

    // TODO: call DELETE documentDeleteUrl zoho api

    const res = await this.appService.deleteDocumentById(idn);

    // TODO: delete docx file in storage?
    return res;
  }

  @Post('documents/:id/sessions/delete')
  async postDocumentSessionsDelete(@Param('id') id: string) {
    console.log('POST documents/:id/sessions/delete:');
    console.log({ id });

    const idn = id?.length ? parseInt(id) : NaN;

    if (Number.isNaN(idn)) {
      throw new HttpException('Invalid id', HttpStatus.BAD_REQUEST);
    }

    // TODO: find sessions by document_id first to get all to be deleted session
    // and call DELETE sessionDeleteUrl zoho api for each session

    const res = await this.appService.deleteSessionsByDocumentId(idn);

    return res;
  }
}
