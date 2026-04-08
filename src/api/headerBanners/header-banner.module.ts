import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { HeaderBanner, HeaderBannerSchema } from './schemas/header-banner.schema';
import { HeaderBannersController } from './header-banner.controller';
import { HeaderBannersService } from './header-banner.service';
// CloudinaryModule là @Global() — không cần import lại

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HeaderBanner.name, schema: HeaderBannerSchema },
    ]),
    MulterModule.register({ storage: memoryStorage() }),
  ],
  controllers: [HeaderBannersController],
  providers: [HeaderBannersService],
  exports: [HeaderBannersService],
})
export class HeaderBannersModule {}