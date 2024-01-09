import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  IApiMergeTemplateWithDataParams,
  IApiPreviewSpreadSheetParams,
  ICallApiCreateOptions,
  ICallApiEditOptions,
  ICallApiPreviewParams,
  ICreateDocumentParams,
  ICreateMergeTemplateDocumentParams,
  IEditDocumentParams,
  IZohoSessionType,
} from './interfaces/zoho';
import axios from 'axios';
import {
  CreateDocument,
  CreateMergeTemplate,
  EditDocument,
  PreviewDocument,
} from './libs/zoho';
import FormData from 'form-data';
import { appendApiKey, appendURLApiKey } from './utils/formDataUtils';
import { readFileSync } from 'fs';

@Injectable()
export class AppService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // Note: this is optional
    await this.$connect();
  }

  async getUsers() {
    return this.user.findMany();
  }

  async getUserById(id: number) {
    return this.user.findUnique({
      where: {
        id,
      },
    });
  }

  async createDocument(
    params: Parameters<(typeof this)['document']['create']>[0],
  ) {
    return this.document.create(params);
  }

  async updateDocument(
    params: Parameters<(typeof this)['document']['update']>[0],
  ) {
    return this.document.update(params);
  }

  async createZohoSession(
    params: Parameters<(typeof this)['zohoSession']['create']>[0],
  ) {
    return this.zohoSession.create(params);
  }

  async getDocuments() {
    return this.document.findMany({
      where: {
        NOT: {
          deleted: true,
        },
      },
    });
  }

  async getZohoSessions() {
    return this.zohoSession.findMany({
      where: {
        NOT: {
          deleted: true,
        },
      },
    });
  }

  async getZohoSessionsByZohoDocId(zoho_document_id: string) {
    return this.zohoSession.findMany({
      where: {
        zoho_document_id,
        NOT: {
          deleted: true,
        },
      },
    });
  }

  async getDocumentById(id: number) {
    return this.document.findUnique({
      where: {
        id,
        NOT: {
          deleted: true,
        },
      },
    });
  }

  async getDocumentByZohoDocId(zoho_document_id: string) {
    return this.document.findUnique({
      where: {
        zoho_document_id,
        NOT: {
          deleted: true,
        },
      },
    });
  }

  async getDocumentByUser(user_id: number) {
    return this.document.findMany({
      where: {
        author_id: user_id,
        NOT: {
          deleted: true,
        },
      },
    });
  }

  async updateZohoDocId(id: number, zoho_document_id: string) {
    return this.document.update({
      where: {
        id,
        NOT: {
          deleted: true,
        },
      },
      data: {
        zoho_document_id,
      },
    });
  }

  async getZohoSession(
    zoho_document_id: string,
    document_id: number,
    session_type: IZohoSessionType,
  ) {
    return this.zohoSession.findFirst({
      where: {
        document_id,
        zoho_document_id,
        session_type,
        NOT: {
          deleted: true,
        },
      },
    });
  }

  async deleteSessionById(id: number) {
    return this.zohoSession.update({
      where: {
        id,
      },
      data: {
        deleted: true,
      },
    });
  }

  async deleteDocumentById(id: number) {
    return this.document.update({
      where: {
        id,
      },
      data: {
        deleted: true,
      },
    });
  }

  async deleteSessionsByDocumentId(id: number) {
    return this.zohoSession.updateMany({
      where: {
        document_id: id,
      },
      data: {
        deleted: true,
      },
    });
  }

  async apiMergeTemplateWithData({
    filename,
    mergeData,
  }: IApiMergeTemplateWithDataParams) {
    /*
curl --location --request POST "https://api.office-integrator.com/writer/officeapi/v1/document/merge" \
  --form "apikey=423s******" \
  --form "output_format=pdf" \
  --form "password=***" \
  --form "file_content=@" \
  --form "merge_data={\"data\":[{\"name\":\"Amelia\",\"email\":\"amelia@zylker.com\"}]}"
      */
    const formData = new FormData();
    appendApiKey(formData);

    // formData.append('editor_settings', JSON.stringify({
    //   language: 'en',
    //   country: '',
    // }));

    formData.append('output_format', 'docx');
    formData.append(
      'file_content',
      readFileSync(`${process.env.DOCUMENT_FOLDER}/${filename}`),
      filename,
    );
    formData.append('merge_data', mergeData);

    console.log({ formData });

    return axios.post(
      `https://api.office-integrator.com/writer/officeapi/v1/document/merge`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        responseType: 'stream',
      },
    );
  }

  // SHEETS API CALLS
  async apiCreateSpreadSheet({
    userId,
    userName,
    filename,
    documentId,
  }: ICreateDocumentParams) {
    /*
curl -X POST \
  https://api.office-integrator.com/sheet/officeapi/v1/spreadsheet \
  -H 'content-type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' \
  -F apikey=423s***** \
  -F 'editor_settings={'\''language'\'':'\''en'\'','\''country'\'':'\''IN'\''}' \
  -F 'permissions={'\''document.export'\'':true,'\''document.print'\'':true,'\''document.edit'\'':true}' \
  -F 'callback_settings={'\''save_format'\'':'\''zsheet'\'','\''save_url'\'':'\''https://zylker.com/save.php/'\''}' \
  -F 'document_info={'\''document_name'\'':'\''Sample'\'', '\''document_id'\'':1349}' \
  -F 'user_info={'\''display_name'\'':'\''Ken'\''}' \
  -F 'ui_options={'\''save_button'\'':'\''show'\''}' 
    */

    const formData = new FormData();
    appendApiKey(formData);

    // formData.append('editor_settings', JSON.stringify({
    //   language: 'en',
    //   country: '',
    // }));

    formData.append(
      'permissions',
      JSON.stringify({
        'document.edit': true,
      }),
    );

    formData.append(
      'callback_settings',
      JSON.stringify({
        save_url: `${process.env.SERVER_URL}/zoho/${documentId}/save`,
        save_url_params: {
          author_id: String(userId),
          doc_type: 'sheet',
        },
      }),
    );

    formData.append(
      'document_info',
      JSON.stringify({
        document_name: filename,
        document_id: documentId,
      }),
    );

    formData.append(
      'user_info',
      JSON.stringify({
        display_name: userName,
      }),
    );

    console.log({ formData });

    return axios.post(
      `https://api.office-integrator.com/sheet/officeapi/v1/spreadsheet`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      },
    );
  }

  async apiPreviewSpreadSheet({ filename }: IApiPreviewSpreadSheetParams) {
    /*
curl --request POST \
  --url 'https://api.office-integrator.com/sheet/officeapi/v1/spreadsheet/preview' \
  --header 'content-type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' \
  --form document=@/Users/username/Spreadsheet/Sample.xlsx \
  --form 'apikey=423s*****' \
  --form language=en
  */

    const formData = new FormData();
    appendApiKey(formData);

    formData.append(
      'document',
      readFileSync(`${process.env.DOCUMENT_FOLDER}/${filename}`),
      filename,
    );

    formData.append('language', 'en');
    // formData.append(
    //   'permissions',
    //   JSON.stringify({
    //     'document.export': true,
    //     'document.print': true,
    //   }),
    // );

    console.log({ formData });

    return axios.post(
      `https://api.office-integrator.com/sheet/officeapi/v1/spreadsheet/preview`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      },
    );
  }

  async callApiCreate({
    type,
    isMergeTemplate,
    createParams,
  }: ICallApiCreateOptions) {
    console.log({ type, isMergeTemplate, createParams });

    if (type === 'sheet') {
      const createSpreadsheetRes = await this.apiCreateSpreadSheet(
        createParams as ICreateDocumentParams,
      );

      console.log({ createSpreadsheetRes });
      return createSpreadsheetRes.data;
    }

    if (isMergeTemplate)
      return CreateMergeTemplate.execute(
        createParams as ICreateMergeTemplateDocumentParams,
      );

    return CreateDocument.execute(createParams as ICreateDocumentParams);
  }

  async callApiPreview({ type, previewParams }: ICallApiPreviewParams) {
    if (type === 'sheet') {
      const res = await this.apiPreviewSpreadSheet(previewParams);
      console.log({ res });
      return res.data;
    }
    return PreviewDocument.execute(previewParams);
  }

  async apiDeleteSession(url: string) {
    return axios.delete(appendURLApiKey(url));
  }

  async apiDeleteDocument(url: string) {
    return axios.delete(appendURLApiKey(url));
  }

  async execDbDeleteZohoSessions(zoho_document_id?: string) {
    const sessions =
      typeof zoho_document_id === 'string'
        ? await this.getZohoSessionsByZohoDocId(zoho_document_id)
        : [];

    const deletedSessions: ((typeof sessions)[number] & {
      jsonSessionData: any;
    })[] = [];

    if (!sessions.length) return [];

    for (const sess of sessions as typeof deletedSessions) {
      try {
        const jsonSessionData = sess.session_data.length
          ? JSON.parse(sess.session_data)
          : {};

        // call DELETE sessionDeleteUrl zoho api

        const {
          session_delete_url,
          sessionDeleteUrl,
          // documentDeleteUrl,
          // document_delete_url,
        } = jsonSessionData;

        const url = session_delete_url ?? sessionDeleteUrl;

        if (url) {
          console.log('Deleting session:', sess);
          const resDeleteSession = await this.apiDeleteSession(url);

          console.log({ resDeleteSession });

          sess.jsonSessionData = jsonSessionData;
          deletedSessions.push(sess);
        }
      } catch (e) {
        console.error(e);
        // throw new HttpException(
        //   'Error deleting session',
        //   HttpStatus.INTERNAL_SERVER_ERROR,
        // );
      }
    }

    await this.deleteSessionByIds(deletedSessions.map((v) => v.id));

    return deletedSessions;
  }

  async deleteSessionByIds(ids: number[]) {
    return this.zohoSession.updateMany({
      where: {
        OR: ids.map((v) => ({ id: v })),
      },
      data: {
        deleted: true,
      },
    });
  }

  async callApiEdit({ editParams, type }: ICallApiEditOptions) {
    console.log({
      editParams,
      type,
    });

    if (type === 'sheet') {
      const editSheetRes = await this.apiEditSpreadSheet(editParams);

      console.log({ editSheetRes });

      return editSheetRes?.data;
    }

    return EditDocument.execute(editParams);
  }

  /*
curl -X POST \
  https://api.office-integrator.com/sheet/officeapi/v1/spreadsheet \
  -H 'content-type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' \
  -F apikey=423s***** \
  -F 'editor_settings={'\''language'\'':'\''en'\'','\''country'\'':'\''IN'\''}' \
  -F 'permissions={'\''document.export'\'':true,'\''document.print'\'':true,'\''document.edit'\'':true}' \
  -F 'callback_settings={'\''save_format'\'':'\''zsheet'\'','\''save_url'\'':'\''https://zylker.com/save.php/'\''}' \
  -F 'document_info={'\''document_name'\'':'\''Sample'\'', '\''document_id'\'':1349}' \
  -F 'user_info={'\''display_name'\'':'\''Ken'\''}' \
  -F 'ui_options={'\''save_button'\'':'\''hide'\''}' 
    */

  async apiEditSpreadSheet({
    userName,
    documentId,
    userId,
    filename, // showFileMenu,
  }: IEditDocumentParams) {
    return this.apiCreateSpreadSheet({
      userName,
      documentId,
      userId,
      filename, // showFileMenu,
    });
  }
}
