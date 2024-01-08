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
  PreviewDocument,
  // CoEditDocument,
} from 'src/libs/zoho';
import * as express from 'express';
import { IPostMergeTemplateBody, IZohoSessionType } from 'src/interfaces/zoho';
import { createNewZohoDocId, isValidDocType } from 'src/utils';
// import amelia from '../../amelia.json';
import { createWriteStream, writeFileSync } from 'fs';

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

  /**
   * Sheet field
   */
  gridview_url: string;
  /**
   * Sheet field
   */
  save_url: string;
  /**
   * Sheet field
   */
  session_delete_url: string;
  /**
   * Sheet field
   */
  download_url: string;
  /**
   * Sheet field
   */
  session_id: string;
  /**
   * Sheet field
   */
  document_delete_url: string;
  /**
   * Sheet field
   */
  document_id: string;
  /**
   * Sheet field
   */
  document_url: string;
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

    @Query('type') type?: 'sheet' | 'writer',
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
      : `Untitled-${new Date().valueOf()}`;

    console.log({ filename: oriFname, sanitizedFilename: filename });

    const redirectPath = isMergeTemplate ? 'create-merge-template' : 'create';

    if (!oriFname) {
      return response.redirect(
        `/${redirectPath}/${filename}?document_id=${merge_document_id}&type={type}`,
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
        // mergeContent: JSON.stringify(),
        // mergeContentName: 'amelia.json',
        newFilename: isMergeTemplate ? filename : '',
      };
    // : {
    //     documentId,
    //     userName,
    //     userId: String(user.id),
    //     filename,
    //   };

    const isTypeSheet = type === 'sheet';

    let res: IGetCreateResponse;
    try {
      res = await this.appService.callApiCreate({
        type,
        isMergeTemplate,
        createParams,
      });
    } catch (e) {
      console.error(e);
      return;
    }

    // sheet res
    /*
gridview_url: 'https://api.office-integrator.com/sheet/officeapi/v1/7c92e8104911a8d0961611b13c8e4c935e9058f4fcf1601c56c2c529b5cbf8c4e79a33ee5162b35cfae0e71a06b580458119cc9593e4c4fde28a3e
bb8f2138d2?zview=rgrid',     
      save_url: 'https://api.office-integrator.com/sheet/officeapi/v1/spreadsheet/7c92e8104911a8d0961611b13c8e4c935e9058f4fcf1601c56c2c529b5cbf8c4e79a33ee5162b35cfae0e71a06b580458119cc9593e4c4
fde28a3ebb8f2138d2/save',        
      session_delete_url: 'https://api.office-integrator.com/sheet/officeapi/v1/session/e0d62a556649af65c864c6a0177b3ab3c277649077e135d8c95ede6d41f3180708ec903684707e2b400c285d748d5643',      
      download_url: 'https://api.office-integrator.com/sheet/officeapi/v1/spreadsheet/7c92e8104911a8d0961611b13c8e4c935e9058f4fcf1601c56c2c529b5cbf8c4e79a33ee5162b35cfae0e71a06b580458119cc9593
e4c4fde28a3ebb8f2138d2/download',   
      session_id: 'e0d62a556649af65c864c6a0177b3ab3c277649077e135d8c95ede6d41f3180708ec903684707e2b400c285d748d5643',                                                                           
      document_delete_url: 'https://api.office-integrator.com/sheet/officeapi/v1/spreadsheet/1704424924391',                                                                                    
      document_id: '1704424924391',                                                             
      document_url: 'https://sheet.zoho.com/sheet/officeapi/v1/7c92e8104911a8d0961611b13c8e4c935e9058f4fcf1601c56c2c529b5cbf8c4e79a33ee5162b35cfae0e71a06b580458119cc9593e4c4fde28a3ebb8f2138d2'
      */

    console.log({ res });

    const session_type: IZohoSessionType = 'create';

    const docIdKey = isTypeSheet ? 'document_id' : 'documentId';
    const sessionIdKey = isTypeSheet ? 'session_id' : 'sessionId';

    // save to db
    const createdSession = await this.appService.createZohoSession({
      data: {
        user_id: uid,
        zoho_document_id: res[docIdKey],
        session_data: JSON.stringify(res),
        session_type,
        session_id: res[sessionIdKey],
      },
    });

    console.log({ createdSession });

    response.json(res);
  }

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

    const docType = savedDoc.doc_type ?? 'writer';

    if (!isValidDocType(docType)) {
      console.error(
        new Error(
          `Invalid doc_type in document: id(${savedDoc.id}) doc_type(${docType})`,
        ),
      );

      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

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
    // const shouldCoEdit = !!existingEditSession;

    const executeParams = {
      documentId: savedDoc.zoho_document_id,
      userId: String(user.id),
      userName: user.name,
      filename: savedDoc.filename,
      showFileMenu: user.id === savedDoc.author_id,
    };

    // if not in db, create new zoho session
    // const res = await (existingEditSession && shouldCoEdit
    //   ? // should be switched based on permission, or we can set different permission for the same edit/co-edit op
    //     EditDocument //CoEditDocument
    //   : EditDocument
    // ).execute(executeParams);

    const res = await this.appService.callApiEdit({
      type: docType,
      editParams: executeParams,
    });

    console.log({ res });

    const isTypeSheet = docType === 'sheet';

    const docIdKey = isTypeSheet ? 'document_id' : 'documentId';
    const sessionIdKey = isTypeSheet ? 'session_id' : 'sessionId';

    const createdEditSession = await this.appService.createZohoSession({
      data: {
        user_id: uid,
        zoho_document_id: res[docIdKey],
        document_id: savedDoc.id,
        session_data: JSON.stringify(res),
        session_type,
        session_id: res[sessionIdKey],
        joined_session_id: existingEditSession?.id,
      },
    });

    console.log({ createdEditSession });

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
          doc_type: body.doc_type ?? 'writer',
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
        doc_type: body.doc_type ?? 'writer',
      },
    });

    console.log({ updatedDoc });
    console.log('POST :id/save: ^^^^^^^^^^^^^^^^^^^^');
  }

  @Post(':id/save-merge-template')
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
    console.log('POST documents/:id/delete: VVVVVVVVVVVVVVVVVVVV');
    console.log({ id });

    const idn = id?.length ? parseInt(id) : NaN;

    if (Number.isNaN(idn)) {
      throw new HttpException('Invalid id', HttpStatus.BAD_REQUEST);
    }

    // find doc metadata
    const dbDoc = await this.appService.getDocumentById(idn);

    if (!dbDoc) {
      throw new HttpException('Unknown document', HttpStatus.NOT_FOUND);
    }

    // find all session connected to this doc and delete
    const deletedSessions = await this.appService.execDbDeleteZohoSessions(
      dbDoc.zoho_document_id!,
    );

    const documentDeleteURLs: string[] = [];
    for (const sess of deletedSessions) {
      const {
        // session_delete_url,
        // sessionDeleteUrl,
        documentDeleteUrl,
        document_delete_url,
      } = sess.jsonSessionData;

      const currentDocumentDeleteUrl = document_delete_url ?? documentDeleteUrl;

      // set documentDeleteUrl
      if (documentDeleteURLs.includes(currentDocumentDeleteUrl)) {
        documentDeleteURLs.push(currentDocumentDeleteUrl);
      }
    }

    const deletedDocumentURLs: string[] = [];
    // call DELETE documentDeleteUrl zoho api
    for (const url of documentDeleteURLs) {
      console.log('Deleting zoho document:', url);
      await this.appService.apiDeleteDocument(url);
      deletedDocumentURLs.push(url);
    }

    const resDeleteDocument = await this.appService.deleteDocumentById(idn);

    console.log({ resDeleteDocument });

    const res = {
      deletedDocument: resDeleteDocument,
      deletedDocumentURLs,
      deletedSessions,
    };

    console.log('POST documents/:id/delete: ^^^^^^^^^^^^^^^^^^^^');

    console.log({ endpointRes: res });

    // TODO: delete docx file in storage?
    return res;
  }

  // @Post('documents/:id/sessions/delete')
  // async postDocumentSessionsDelete(@Param('id') id: string) {
  //   console.log('POST documents/:id/sessions/delete:');
  //   console.log({ id });

  //   const idn = id?.length ? parseInt(id) : NaN;

  //   if (Number.isNaN(idn)) {
  //     throw new HttpException('Invalid id', HttpStatus.BAD_REQUEST);
  //   }

  //   // TODO: find sessions by document_id first to get all to be deleted session
  //   // and call DELETE sessionDeleteUrl zoho api for each session

  //   const res = await this.appService.deleteSessionsByDocumentId(idn);

  //   return res;
  // }

  @Post('merge-template')
  async postMergeTemplate(@Body() body: IPostMergeTemplateBody): Promise<any> {
    console.log(body);

    if (typeof body !== 'object')
      throw new HttpException('Invalid POST data', HttpStatus.BAD_REQUEST);

    const { merge_filename, document_id, merge_data, author_id } = body;

    if (typeof merge_filename !== 'string' || !merge_filename.length) {
      throw new HttpException('Invalid merge_filename', HttpStatus.BAD_REQUEST);
    }

    if (typeof merge_data !== 'string') {
      throw new HttpException('Invalid merge_data', HttpStatus.BAD_REQUEST);
    }

    try {
      JSON.parse(merge_data);
    } catch (e) {
      console.error(e);
      throw new HttpException('Invalid merge_data', HttpStatus.BAD_REQUEST);
    }

    const uid = author_id?.length ? parseInt(author_id) : NaN;
    if (Number.isNaN(uid)) {
      console.error({ author_id });
      throw new HttpException('Invalid author_id', HttpStatus.BAD_REQUEST);
    }

    const user = await this.appService.getUserById(uid);
    if (!user) {
      console.error({ user });
      throw new HttpException('Invalid user', HttpStatus.UNAUTHORIZED);
    }

    const mergeDocumentId = document_id?.length ? parseInt(document_id) : NaN;

    if (Number.isNaN(mergeDocumentId)) {
      console.error({ document_id: mergeDocumentId });
      throw new HttpException('Invalid document_id', HttpStatus.BAD_REQUEST);
    }

    const baseDocument = await this.appService.getDocumentById(mergeDocumentId);

    if (!baseDocument) {
      console.error({ baseDocument });
      throw new HttpException(
        'Invalid merge_document_id',
        HttpStatus.BAD_REQUEST,
      );
    }

    const oriFname = merge_filename;
    const mergeFilenameTemp = decodeURIComponent(merge_filename);
    const mergeFilename = `${mergeFilenameTemp}${
      mergeFilenameTemp.endsWith('.docx') ? '' : '.docx'
    }`;

    console.log({ merge_filename: oriFname, sanitizedFilename: mergeFilename });

    const res = await this.appService.apiMergeTemplateWithData({
      filename: baseDocument.filename,
      mergeData: merge_data,
    });

    console.log('res:');
    // console.log(res);
    // console.log(res.data);

    return new Promise(async (r, j) => {
      const savePath = `${process.env.DOCUMENT_FOLDER}/${mergeFilename}`;

      const stream = res.data.pipe(createWriteStream(savePath));

      stream.on('finish', async () => {
        const createdDoc = await this.appService.createDocument({
          data: {
            filename: mergeFilename,
            existing: false,
            author_id: user.id,
            file_data: JSON.stringify({ mergeFilename, mergeData: merge_data }),
          },
        });

        console.log({ createdDoc });

        r(createdDoc);
      });

      stream.on('error', (e: any) => j(e));
    });
    // const createParams = {};

    // let res: IGetCreateResponse;
    // try {
    //   // res = await this.appService.callApiCreate({
    //   //   type,
    //   //   isMergeTemplate,
    //   //   createParams,
    //   // });
    // } catch (e) {
    //   console.error(e);
    //   return;
    // }

    // sheet res

    // console.log({ res });

    // const session_type: IZohoSessionType = 'create';

    // const docIdKey = isTypeSheet ? 'document_id' : 'documentId';
    // const sessionIdKey = isTypeSheet ? 'session_id' : 'sessionId';

    // save to db
    // const createdSession = await this.appService.createZohoSession({
    //   data: {
    //     user_id: uid,
    //     zoho_document_id: res[docIdKey],
    //     session_data: JSON.stringify(res),
    //     session_type,
    //     session_id: res[sessionIdKey],
    //   },
    // });

    // console.log({ createdSession });

    // response.json(res);
  }
}
