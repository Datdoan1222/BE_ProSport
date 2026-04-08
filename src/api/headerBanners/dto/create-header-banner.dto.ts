import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreateHeaderBannerDto {
  @ApiProperty({ example: 'Banner Tết 2026', description: 'Tên banner' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 'banner-tet-2026',
    description: 'Mã định danh (chữ thường, không dấu, dấu gạch ngang)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'codeName chỉ chứa chữ thường, số và dấu gạch ngang (vd: banner-tet-2026)',
  })
  codeName!: string;

  // Set bởi controller sau khi upload Cloudinary
  image?: string | null;
}