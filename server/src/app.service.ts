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
}
