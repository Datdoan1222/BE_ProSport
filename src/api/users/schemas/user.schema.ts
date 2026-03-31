import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

export enum UserStatus {
  OWNER = 'owner',
  MEMBER = 'member',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Tên người dùng' })
  @Prop({ required: true, trim: true })
  name: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Ảnh đại diện',
  })
  @Prop({ default: null })
  avatar: string;

  @ApiProperty({
    example: 'user@gmail.com',
    description: 'Email',
  })
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @ApiProperty({
    example: '0987654321',
    description: 'Số điện thoại',
  })
  @Prop({
    required: true,
    match: [/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ'],
  })
  phone: string;

  @ApiProperty({
    enum: Gender,
    example: Gender.MALE,
    description: 'Giới tính',
  })
  @Prop({ enum: Gender, default: Gender.OTHER })
  gender: Gender;

  @ApiProperty({
    enum: UserStatus,
    example: UserStatus.OWNER,
    description: 'Vai trò: owner | member',
  })
  @Prop({ enum: UserStatus, default: UserStatus.MEMBER })
  status: UserStatus;

  @ApiProperty({ example: true, description: 'Kích hoạt / vô hiệu hóa' })
  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
