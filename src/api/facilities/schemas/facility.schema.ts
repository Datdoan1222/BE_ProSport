import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type FacilityDocument = Facility & Document;

export enum FacilityStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  MAINTENANCE = 'maintenance',
}

@Schema({ timestamps: true, collection: 'facilities' })
export class Facility {
  @ApiProperty({ example: 'Swimming Pool', description: 'Tên cơ sở' })
  @Prop({ required: true, trim: true })
  name: string;

  @ApiProperty({
    type: [String],
    example: ['https://example.com/img1.jpg'],
    description: 'Danh sách ảnh',
  })
  @Prop({ type: [String], default: [] })
  images: string[];

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Ảnh đại diện',
  })
  @Prop({ default: null })
  avatar: string;

  @ApiProperty({
    enum: FacilityStatus,
    example: FacilityStatus.OPEN,
    description: 'Trạng thái hoạt động',
  })
  @Prop({ enum: FacilityStatus, default: FacilityStatus.OPEN })
  status: FacilityStatus;

  @ApiProperty({ example: '07:00', description: 'Giờ mở cửa (HH:mm)' })
  @Prop({ required: true })
  openTime: string;

  @ApiProperty({ example: '22:00', description: 'Giờ đóng cửa (HH:mm)' })
  @Prop({ required: true })
  closeTime: string;

  @ApiProperty({ example: '123 Nguyễn Văn A, Q.1, TP.HCM', description: 'Địa chỉ' })
  @Prop({ required: true })
  address: string;

  @ApiProperty({ example: true, description: 'Kích hoạt / vô hiệu hóa' })
  @Prop({ default: true })
  isActive: boolean;
}

export const FacilitySchema = SchemaFactory.createForClass(Facility);