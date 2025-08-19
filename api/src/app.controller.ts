import {
  Controller,
  Get,
  Logger,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';
import appConfig from './core/config';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
    cloudinary.config({
      cloud_name: appConfig.cloudinary.name,
      api_key: appConfig.cloudinary.apiKey,
      api_secret: appConfig.cloudinary.secret,
    });
  }

  logger = new Logger(AppController.name);

  @Get()
  getHello(): string {
    return this.appService.appInfo();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { timestamp: Math.floor(Date.now() / 1000) },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        uploadStream.end(file.buffer);
      });

      return result;
    } catch (error) {
      this.logger.error('Error uploading to Cloudinary:');
      if (error.error && error.error.message) {
        this.logger.error(error.error.message);
      }
      throw error;
    }
  }
}
