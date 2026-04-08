import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Cầu lông', description: 'Tên danh mục' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 'cau-long',
    description: 'Mã định danh (chữ thường, không dấu, dùng dấu gạch ngang)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'codeName chỉ chứa chữ thường, số và dấu gạch ngang (vd: cau-long)',
  })
  codeName!: string;

  // Set bởi controller sau khi upload Cloudinary
  image?: string | null;
}