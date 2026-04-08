import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  // ─── CREATE ──────────────────────────────────────────────────────────────────
  async create(dto: CreateCategoryDto): Promise<CategoryDocument> {
    const exists = await this.categoryModel.findOne({ codeName: dto.codeName });
    if (exists) {
      throw new ConflictException(`codeName "${dto.codeName}" đã tồn tại`);
    }
    const category = new this.categoryModel(dto);
    const saved = await category.save();
    return saved.toObject();
  }

  // ─── FIND ALL ─────────────────────────────────────────────────────────────────
  async findAll(query: QueryCategoryDto): Promise<{
    data: CategoryDocument[];
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
      this.categoryModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      this.categoryModel.countDocuments(filter),
    ]);

    return {
      data: data as CategoryDocument[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── FIND ONE ─────────────────────────────────────────────────────────────────
  async findOne(id: string): Promise<CategoryDocument> {
    this.validateObjectId(id);
    const category = await this.categoryModel.findById(id).lean();
    if (!category) throw new NotFoundException(`Không tìm thấy category với id: ${id}`);
    return category as CategoryDocument;
  }

  // ─── FIND BY CODE NAME ────────────────────────────────────────────────────────
  async findByCodeName(codeName: string): Promise<CategoryDocument> {
    const category = await this.categoryModel.findOne({ codeName }).lean();
    if (!category) throw new NotFoundException(`Không tìm thấy category: ${codeName}`);
    return category as CategoryDocument;
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryDocument> {
    this.validateObjectId(id);

    if (dto.codeName) {
      const exists = await this.categoryModel.findOne({
        codeName: dto.codeName,
        _id: { $ne: id },
      });
      if (exists) throw new ConflictException(`codeName "${dto.codeName}" đã tồn tại`);
    }

    const updated = await this.categoryModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .lean();

    if (!updated) throw new NotFoundException(`Không tìm thấy category với id: ${id}`);
    return updated as CategoryDocument;
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────────
  async remove(id: string): Promise<{ message: string }> {
    this.validateObjectId(id);
    const category = await this.categoryModel.findByIdAndDelete(id);
    if (!category) throw new NotFoundException(`Không tìm thấy category với id: ${id}`);
    return { message: `Đã xóa category "${category.name}" thành công` };
  }

  // ─── UPDATE IMAGE ─────────────────────────────────────────────────────────────
  async updateImage(id: string, imageUrl: string): Promise<CategoryDocument> {
    this.validateObjectId(id);
    const updated = await this.categoryModel
      .findByIdAndUpdate(id, { $set: { image: imageUrl } }, { new: true })
      .lean();
    if (!updated) throw new NotFoundException(`Không tìm thấy category với id: ${id}`);
    return updated as CategoryDocument;
  }

  // ─── HELPER ───────────────────────────────────────────────────────────────────
  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`"${id}" không phải ObjectId hợp lệ`);
    }
  }
}