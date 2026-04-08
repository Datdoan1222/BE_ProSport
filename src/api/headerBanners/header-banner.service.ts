import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { HeaderBanner, HeaderBannerDocument } from './schemas/header-banner.schema';
import { CreateHeaderBannerDto } from './dto/create-header-banner.dto';
import { UpdateHeaderBannerDto } from './dto/update-header-banner.dto';
import { QueryHeaderBannerDto } from './dto/query-header-banner.dto';

@Injectable()
export class HeaderBannersService {
  constructor(
    @InjectModel(HeaderBanner.name)
    private readonly bannerModel: Model<HeaderBannerDocument>,
  ) {}

  // ─── CREATE ──────────────────────────────────────────────────────────────────
  async create(dto: CreateHeaderBannerDto): Promise<HeaderBannerDocument> {
    const exists = await this.bannerModel.findOne({ codeName: dto.codeName });
    if (exists) throw new ConflictException(`codeName "${dto.codeName}" đã tồn tại`);

    const banner = new this.bannerModel(dto);
    const saved = await banner.save();
    return saved.toObject();
  }

  // ─── FIND ALL ─────────────────────────────────────────────────────────────────
  async findAll(query: QueryHeaderBannerDto): Promise<{
    data: HeaderBannerDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { name:     { $regex: search, $options: 'i' } },
        { codeName: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.bannerModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      this.bannerModel.countDocuments(filter),
    ]);

    return {
      data: data as HeaderBannerDocument[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── FIND ONE ─────────────────────────────────────────────────────────────────
  async findOne(id: string): Promise<HeaderBannerDocument> {
    this.validateObjectId(id);
    const banner = await this.bannerModel.findById(id).lean();
    if (!banner) throw new NotFoundException(`Không tìm thấy banner với id: ${id}`);
    return banner as HeaderBannerDocument;
  }

  // ─── FIND BY CODE NAME ────────────────────────────────────────────────────────
  async findByCodeName(codeName: string): Promise<HeaderBannerDocument> {
    const banner = await this.bannerModel.findOne({ codeName }).lean();
    if (!banner) throw new NotFoundException(`Không tìm thấy banner: ${codeName}`);
    return banner as HeaderBannerDocument;
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateHeaderBannerDto): Promise<HeaderBannerDocument> {
    this.validateObjectId(id);

    if (dto.codeName) {
      const exists = await this.bannerModel.findOne({
        codeName: dto.codeName,
        _id: { $ne: id },
      });
      if (exists) throw new ConflictException(`codeName "${dto.codeName}" đã tồn tại`);
    }

    const updated = await this.bannerModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .lean();

    if (!updated) throw new NotFoundException(`Không tìm thấy banner với id: ${id}`);
    return updated as HeaderBannerDocument;
  }

  // ─── UPDATE IMAGE ─────────────────────────────────────────────────────────────
  async updateImage(id: string, imageUrl: string): Promise<HeaderBannerDocument> {
    this.validateObjectId(id);
    const updated = await this.bannerModel
      .findByIdAndUpdate(id, { $set: { image: imageUrl } }, { new: true })
      .lean();
    if (!updated) throw new NotFoundException(`Không tìm thấy banner với id: ${id}`);
    return updated as HeaderBannerDocument;
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────────
  async remove(id: string): Promise<{ message: string }> {
    this.validateObjectId(id);
    const banner = await this.bannerModel.findByIdAndDelete(id);
    if (!banner) throw new NotFoundException(`Không tìm thấy banner với id: ${id}`);
    return { message: `Đã xóa banner "${banner.name}" thành công` };
  }

  // ─── HELPER ───────────────────────────────────────────────────────────────────
  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`"${id}" không phải ObjectId hợp lệ`);
    }
  }
}