import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsBoolean,
  IsEnum,
  Matches,
  IsUrl,
} from 'class-validator';
import { FacilityStatus } from '../schemas/facility.schema';

export class CreateFacilityDto {
  @ApiProperty({ example: 'Swimming Pool', description: 'Tên cơ sở' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
    description: 'Danh sách URL ảnh',
  })
  @IsOptional()
  @IsArray()
  @IsUrl(
    {},
    { each: true, message: 'Mỗi phần tử trong images phải là URL hợp lệ' },
  )
  images?: string[];

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'URL ảnh đại diện',
  })
  @IsOptional()
  @IsUrl({}, { message: 'avatar phải là URL hợp lệ' })
  avatar?: string;

  @ApiProperty({ example: '65f123abc...', description: 'ID của user' })
  @IsString()
  @IsNotEmpty()
  userId?: string;

  @ApiPropertyOptional({
    enum: FacilityStatus,
    example: FacilityStatus.OPEN,
    description: 'Trạng thái: open | closed | maintenance',
  })
  @IsOptional()
  @IsEnum(FacilityStatus)
  status?: FacilityStatus;

  @ApiProperty({ example: '07:00', description: 'Giờ mở cửa định dạng HH:mm' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'openTime phải có định dạng HH:mm',
  })
  openTime: string;

  @ApiProperty({
    example: '22:00',
    description: 'Giờ đóng cửa định dạng HH:mm',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'closeTime phải có định dạng HH:mm',
  })
  closeTime: string;

  @ApiProperty({
    example: '123 Nguyễn Văn A, Q.1, TP.HCM',
    description: 'Địa chỉ cơ sở',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ example: true, description: 'Trạng thái kích hoạt' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1) return true;
    if (value === 'false' || value === false || value === 0) return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;
}
