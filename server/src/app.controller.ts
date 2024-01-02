import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import {
  User as UserModel,
  Document as DocumentModel,
  ZohoSession as ZohoSessionModel,
} from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('users')
  getUsers(): Promise<UserModel[]> {
    return this.appService.getUsers();
  }

  @Get('documents')
  getDocuments(): Promise<DocumentModel[]> {
    return this.appService.getDocuments();
  }

  @Get('sessions')
  getSessions(): Promise<ZohoSessionModel[]> {
    return this.appService.getZohoSessions();
  }

  @Post('documents')
  @UseInterceptors(
    FileInterceptor('file', {
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
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('POST documents:');
    console.log({ params, body, queries, headers, file });

    const createdDoc = await this.appService.createDocument({
      data: {
        filename: file.filename,
        existing: true,
        author_id: body.author_id,
        file_data: JSON.stringify(file),
      },
    });

    console.log({ createdDoc });

    return createdDoc;
  }
}
