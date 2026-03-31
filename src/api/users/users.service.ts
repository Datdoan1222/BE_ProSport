import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  // ─── CREATE ──────────────────────────────────────────────────────────────────
  async create(dto: CreateUserDto): Promise<UserDocument> {
    const exists = await this.userModel.findOne({ email: dto.email });
    if (exists) {
      throw new ConflictException(`Email "${dto.email}" đã được sử dụng`);
    }
    const user = new this.userModel(dto);
    const saved = await user.save();
    return saved.toObject();
  }

  // ─── FIND ALL ─────────────────────────────────────────────────────────────────
  async findAll(query: QueryUserDto): Promise<{
    data: UserDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, status, gender, isActive } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (status !== undefined)   filter.status   = status;
    if (gender !== undefined)   filter.gender   = gender;
    if (isActive !== undefined) filter.isActive = isActive;

    const [data, total] = await Promise.all([
      this.userModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      data: data as UserDocument[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── FIND ONE ─────────────────────────────────────────────────────────────────
  async findOne(id: string): Promise<UserDocument> {
    this.validateObjectId(id);
    const user = await this.userModel.findById(id).lean();
    if (!user) throw new NotFoundException(`Không tìm thấy user với id: ${id}`);
    return user as UserDocument;
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateUserDto): Promise<UserDocument> {
    this.validateObjectId(id);

    // Kiểm tra email trùng nếu có update email
    if (dto.email) {
      const exists = await this.userModel.findOne({
        email: dto.email,
        _id: { $ne: id },
      });
      if (exists) throw new ConflictException(`Email "${dto.email}" đã được sử dụng`);
    }

    const updated = await this.userModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .lean();

    if (!updated) throw new NotFoundException(`Không tìm thấy user với id: ${id}`);
    return updated as UserDocument;
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────────
  async remove(id: string): Promise<{ message: string }> {
    this.validateObjectId(id);
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) throw new NotFoundException(`Không tìm thấy user với id: ${id}`);
    return { message: `Đã xóa user "${user.name}" thành công` };
  }

  // ─── TOGGLE isActive ──────────────────────────────────────────────────────────
  async toggleActive(id: string): Promise<UserDocument> {
    this.validateObjectId(id);
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException(`Không tìm thấy user với id: ${id}`);
    user.isActive = !user.isActive;
    const saved = await user.save();
    return saved.toObject() as UserDocument;
  }

  // ─── UPDATE AVATAR ────────────────────────────────────────────────────────────
  async updateAvatar(id: string, avatarUrl: string): Promise<UserDocument> {
    this.validateObjectId(id);
    const updated = await this.userModel
      .findByIdAndUpdate(id, { $set: { avatar: avatarUrl } }, { new: true })
      .lean();
    if (!updated) throw new NotFoundException(`Không tìm thấy user với id: ${id}`);
    return updated as UserDocument;
  }

  // ─── HELPER ───────────────────────────────────────────────────────────────────
  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`"${id}" không phải ObjectId hợp lệ`);
    }
  }
}