import {
  Injectable,
  Logger,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

export interface UploadResult {
  url: string;
  publicId: string;
}

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryService.name);

  onModuleInit() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    this.logger.log('✅ Cloudinary initialized');
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = 'uploads',
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder, resource_type: 'image' },
          (error, result: UploadApiResponse | undefined) => {
            if (error) {
              this.logger.error('Upload failed:', error.message);
              return reject(
                new InternalServerErrorException('Upload thất bại'),
              );
            }
            if (!result) {
              return reject(
                new InternalServerErrorException('Upload thất bại'),
              );
            }
            resolve({ url: result.secure_url, publicId: result.public_id });
          },
        )
        .end(file.buffer);
    });
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder = 'uploads',
  ): Promise<UploadResult[]> {
    return Promise.all(files.map((f) => this.uploadFile(f, folder)));
  }

  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
