import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

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
}
