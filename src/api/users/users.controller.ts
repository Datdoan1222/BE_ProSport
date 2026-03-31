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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ─── POST /users ──────────────────────────────────────────────────────────────
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Tạo mới user (kèm upload avatar)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'email', 'phone'],
      properties: {
        name:     { type: 'string', example: 'Nguyễn Văn A' },
        email:    { type: 'string', example: 'user@gmail.com' },
        phone:    { type: 'string', example: '0987654321' },
        gender:   { type: 'string', enum: ['male', 'female', 'other'], example: 'male' },
        status:   { type: 'string', enum: ['owner', 'member'], example: 'member' },
        isActive: { type: 'string', example: 'true' },
        avatar:   { type: 'string', format: 'binary', description: 'Ảnh đại diện' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 409, description: 'Email đã tồn tại' })
  async create(
    @Body() dto: CreateUserDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    if (avatar) {
      const { url } = await this.cloudinaryService.uploadFile(
        avatar,
        'users/avatars',
      );
      dto.avatar = url;
    }
    return this.usersService.create(dto);
  }

  // ─── GET /users ───────────────────────────────────────────────────────────────
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Danh sách user (phân trang + filter)' })
  @ApiResponse({ status: 200, description: 'Danh sách user' })
  findAll(@Query() query: QueryUserDto) {
    return this.usersService.findAll(query);
  }

  // ─── GET /users/:id ───────────────────────────────────────────────────────────
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Chi tiết user' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Chi tiết user' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // ─── PATCH /users/:id ─────────────────────────────────────────────────────────
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật thông tin user' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  // ─── PATCH /users/:id/avatar ──────────────────────────────────────────────────
  @Patch(':id/avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Cập nhật avatar user' })
  @ApiParam({ name: 'id' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['avatar'],
      properties: {
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Cập nhật avatar thành công' })
  async updateAvatar(
    @Param('id') id: string,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    const { url } = await this.cloudinaryService.uploadFile(
      avatar,
      'users/avatars',
    );
    return this.usersService.updateAvatar(id, url);
  }

  // ─── DELETE /users/:id ────────────────────────────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa user' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // ─── PATCH /users/:id/toggle-active ──────────────────────────────────────────
  @Patch(':id/toggle-active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bật/tắt isActive' })
  @ApiParam({ name: 'id' })
  toggleActive(@Param('id') id: string) {
    return this.usersService.toggleActive(id);
  }
}