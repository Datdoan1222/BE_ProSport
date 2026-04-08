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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ─── POST /categories ─────────────────────────────────────────────────────────
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Tạo mới category (kèm upload ảnh)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'codeName'],
      properties: {
        name:     { type: 'string', example: 'Cầu lông' },
        codeName: { type: 'string', example: 'cau-long' },
        image:    { type: 'string', format: 'binary', description: 'Ảnh đại diện' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 409, description: 'codeName đã tồn tại' })
  async create(
    @Body() dto: CreateCategoryDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    if (image) {
      const { url } = await this.cloudinaryService.uploadFile(image, 'categories');
      dto.image = url;
    }
    return this.categoriesService.create(dto);
  }

  // ─── GET /categories ──────────────────────────────────────────────────────────
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Danh sách category (phân trang + tìm kiếm)' })
  @ApiResponse({ status: 200, description: 'Danh sách category' })
  findAll(@Query() query: QueryCategoryDto) {
    return this.categoriesService.findAll(query);
  }

  // ─── GET /categories/:id ──────────────────────────────────────────────────────
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Chi tiết category theo id' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Chi tiết category' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  // ─── GET /categories/code/:codeName ──────────────────────────────────────────
  @Get('code/:codeName')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tìm category theo codeName' })
  @ApiParam({ name: 'codeName', example: 'cau-long' })
  @ApiResponse({ status: 200, description: 'Chi tiết category' })
  findByCodeName(@Param('codeName') codeName: string) {
    return this.categoriesService.findByCodeName(codeName);
  }

  // ─── PATCH /categories/:id ────────────────────────────────────────────────────
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật category' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  // ─── PATCH /categories/:id/image ─────────────────────────────────────────────
  @Patch(':id/image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Cập nhật ảnh category' })
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
    const { url } = await this.cloudinaryService.uploadFile(image, 'categories');
    return this.categoriesService.updateImage(id, url);
  }

  // ─── DELETE /categories/:id ───────────────────────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa category' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}