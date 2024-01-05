import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  // IApiCreateSpreadSheetParams,
  ICallApiCreateOptions,
  ICreateDocumentParams,
  ICreateMergeTemplateDocumentParams,
  IZohoSessionType,
} from './interfaces/zoho';
import axios from 'axios';
// import { createNewZohoDocId } from './utils';
import { CreateDocument, CreateMergeTemplate } from './libs/zoho';
import FormData from 'form-data';
import { appendApiKey, appendURLApiKey } from './utils/formDataUtils';

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
    return this.document.findMany();
  }

  async getZohoSessions() {
    return this.zohoSession.findMany();
  }

  async getZohoSessionsByZohoDocId(zoho_document_id: string) {
    return this.zohoSession.findMany({
      where: {
        zoho_document_id,
      },
    });
  }

  async getDocumentById(id: number) {
    return this.document.findUnique({
      where: {
        id,
      },
    });
  }

  async getDocumentByZohoDocId(zoho_document_id: string) {
    return this.document.findUnique({
      where: {
        zoho_document_id,
      },
    });
  }

  async getDocumentByUser(user_id: number) {
    return this.document.findMany({
      where: {
        author_id: user_id,
      },
    });
  }

  async updateZohoDocId(id: number, zoho_document_id: string) {
    return this.document.update({
      where: {
        id,
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
      },
    });
  }

  async deleteSessionById(id: number) {
    return this.zohoSession.delete({
      where: {
        id,
      },
    });
  }

  async deleteDocumentById(id: number) {
    return this.document.delete({
      where: {
        id,
      },
    });
  }

  async deleteSessionsByDocumentId(id: number) {
    return this.zohoSession.deleteMany({
      where: {
        document_id: id,
      },
    });
  }

  /*
curl -X POST \
  https://api.office-integrator.com/sheet/officeapi/v1/spreadsheet \
  -H 'content-type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' \
  -F apikey=423s***** \
  -F 'editor_settings={'\''language'\'':'\''en'\'','\''country'\'':'\''IN'\''}' \
  -F 'permissions={'\''document.export'\'':true,'\''document.print'\'':true,'\''document.edit'\'':true}' \
  -F 'callback_settings={'\''save_format'\'':'\''zsheet'\'','\''save_url'\'':'\''https://zylker.com/save.php/'\''}' \
  -F 'document_info={'\''document_name'\'':'\''New'\'', '\''document_id'\'':1349}' \
  -F 'user_info={'\''display_name'\'':'\''Ken'\''}' \
  -F 'ui_options'={'\''save_button'\'':'\''hide'\''}' 
    */

  // SHEETS API CALLS
  async apiCreateSpreadSheet({
    userId,
    userName,
    filename,
    documentId,
  }: ICreateDocumentParams) {
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

  async apiDeleteSession(url: string) {
    return axios.delete(appendURLApiKey(url));
  }
}
