import {
  Controller, Get, Post, Body, Patch, Param,
  Delete, Query, HttpCode, HttpStatus,
  UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags, ApiOperation, ApiResponse, ApiParam,
  ApiBearerAuth, ApiConsumes, ApiBody,
} from '@nestjs/swagger';
import { CreateHeaderBannerDto } from './dto/create-header-banner.dto';
import { UpdateHeaderBannerDto } from './dto/update-header-banner.dto';
import { QueryHeaderBannerDto } from './dto/query-header-banner.dto';
import { HeaderBannersService } from './header-banner.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@ApiTags('Header Banners')
@ApiBearerAuth()
@Controller('header-banners')
export class HeaderBannersController {
  constructor(
    private readonly bannersService: HeaderBannersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ─── POST /header-banners ─────────────────────────────────────────────────────
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Tạo mới header banner (kèm upload ảnh)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'codeName'],
      properties: {
        name:     { type: 'string', example: 'Banner Tết 2026' },
        codeName: { type: 'string', example: 'banner-tet-2026' },
        image:    { type: 'string', format: 'binary', description: 'Ảnh banner' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 409, description: 'codeName đã tồn tại' })
  async create(
    @Body() dto: CreateHeaderBannerDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    if (image) {
      const { url } = await this.cloudinaryService.uploadFile(image, 'header-banners');
      dto.image = url;
    }
    return this.bannersService.create(dto);
  }

  // ─── GET /header-banners ──────────────────────────────────────────────────────
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Danh sách header banner (phân trang + tìm kiếm)' })
  @ApiResponse({ status: 200, description: 'Danh sách banner' })
  findAll(@Query() query: QueryHeaderBannerDto) {
    return this.bannersService.findAll(query);
  }

  // ─── GET /header-banners/:id ──────────────────────────────────────────────────
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Chi tiết banner theo id' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Chi tiết banner' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  findOne(@Param('id') id: string) {
    return this.bannersService.findOne(id);
  }

  // ─── GET /header-banners/code/:codeName ───────────────────────────────────────
  @Get('code/:codeName')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tìm banner theo codeName' })
  @ApiParam({ name: 'codeName', example: 'banner-tet-2026' })
  @ApiResponse({ status: 200, description: 'Chi tiết banner' })
  findByCodeName(@Param('codeName') codeName: string) {
    return this.bannersService.findByCodeName(codeName);
  }

  // ─── PATCH /header-banners/:id ────────────────────────────────────────────────
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật banner' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  update(@Param('id') id: string, @Body() dto: UpdateHeaderBannerDto) {
    return this.bannersService.update(id, dto);
  }

  // ─── PATCH /header-banners/:id/image ─────────────────────────────────────────
  @Patch(':id/image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Cập nhật ảnh banner' })
  @ApiParam({ name: 'id' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image'],
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Cập nhật ảnh thành công' })
  async updateImage(
    @Param('id') id: string,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const { url } = await this.cloudinaryService.uploadFile(image, 'header-banners');
    return this.bannersService.updateImage(id, url);
  }

  // ─── DELETE /header-banners/:id ───────────────────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa banner' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  remove(@Param('id') id: string) {
    return this.bannersService.remove(id);
  }
}