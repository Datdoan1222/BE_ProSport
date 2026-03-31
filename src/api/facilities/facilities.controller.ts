import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FacilitiesService } from './facilities.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { QueryFacilityDto } from './dto/query-facility.dto';
import { memoryStorage } from 'multer';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@ApiTags('Facilities')
@ApiBearerAuth()
@Controller('facilities')
export class FacilitiesController {
  constructor(
    private readonly facilitiesService: FacilitiesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ─── POST /facilities ─────────────────────────────────────────────────────────
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'images', maxCount: 10 },
      ],
      { storage: memoryStorage() },
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Tạo mới facility (kèm upload ảnh)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'openTime', 'closeTime', 'address'],
      properties: {
        name: { type: 'string', example: 'Hồ bơi Olympic' },
        openTime: { type: 'string', example: '07:00' },
        closeTime: { type: 'string', example: '22:00' },
        address: { type: 'string', example: '123 Nguyễn Văn Linh' },
        status: { type: 'string', enum: ['open', 'closed', 'maintenance'] },
        isActive: { type: 'boolean', example: true },
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Ảnh đại diện',
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Danh sách ảnh',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async create(
    @Body() dto: CreateFacilityDto,
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    // Upload avatar nếu có
    if (files?.avatar?.[0]) {
      const { url } = await this.cloudinaryService.uploadFile(
        files.avatar[0],
        'facilities/avatars',
      );
      dto.avatar = url;
    }

    // Upload images nếu có
    if (files?.images?.length) {
      const results = await this.cloudinaryService.uploadMultipleFiles(
        files.images,
        'facilities/images',
      );
      dto.images = results.map((r) => r.url);
    }

    return this.facilitiesService.create(dto);
  }

  // ─── GET /facilities ──────────────────────────────────────────────────────────
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lấy danh sách facility (có phân trang, tìm kiếm, lọc)',
  })
  @ApiResponse({ status: 200, description: 'Danh sách facility' })
  findAll(@Query() query: QueryFacilityDto) {
    return this.facilitiesService.findAll(query);
  }

  // ─── GET /facilities/:id ──────────────────────────────────────────────────────
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy chi tiết một facility theo id' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId của facility' })
  @ApiResponse({ status: 200, description: 'Chi tiết facility' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  findOne(@Param('id') id: string) {
    return this.facilitiesService.findOne(id);
  }

  // ─── PATCH /facilities/:id ────────────────────────────────────────────────────
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật thông tin facility' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId của facility' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  update(
    @Param('id') id: string,
    @Body() updateFacilityDto: UpdateFacilityDto,
  ) {
    return this.facilitiesService.update(id, updateFacilityDto);
  }

  // ─── DELETE /facilities/:id ───────────────────────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa một facility' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId của facility' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  remove(@Param('id') id: string) {
    return this.facilitiesService.remove(id);
  }

  // ─── PATCH /facilities/:id/toggle-active ──────────────────────────────────────
  @Patch(':id/toggle-active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bật/tắt trạng thái isActive của facility' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId của facility' })
  @ApiResponse({ status: 200, description: 'Đã toggle isActive' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  toggleActive(@Param('id') id: string) {
    return this.facilitiesService.toggleActive(id);
  }
}
