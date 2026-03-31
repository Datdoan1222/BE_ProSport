import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FacilitiesModule } from './api/facilities/facilities.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UsersModule } from './api/users/users.module';

@Module({
  imports: [
    FacilitiesModule,
    UsersModule,
    MongooseModule.forRoot('mongodb://localhost:27017/pro-sport-db'),
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
