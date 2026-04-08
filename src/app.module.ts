import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FacilitiesModule } from './api/facilities/facilities.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UsersModule } from './api/users/users.module';
import { AuthModule } from './api/auth/auth.module';
import { CategoriesModule } from './api/categories/categories.module';
import { HeaderBannersModule } from './api/headerBanners/header-banner.module';

@Module({
  imports: [
    FacilitiesModule,
    UsersModule,
    // AuthModule,
    MongooseModule.forRoot('mongodb://localhost:27017/pro-sport-db'),
    CloudinaryModule,
    CategoriesModule,
    HeaderBannersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
