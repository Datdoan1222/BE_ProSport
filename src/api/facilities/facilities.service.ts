import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Facility, FacilityDocument } from './schemas/facility.schema';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { QueryFacilityDto } from './dto/query-facility.dto';

@Injectable()
export class FacilitiesService {
  constructor(
    @InjectModel(Facility.name)
    private readonly facilityModel: Model<FacilityDocument>,
  ) {}

  // ─── CREATE ──────────────────────────────────────────────────────────────────
  async create(dto: CreateFacilityDto): Promise<FacilityDocument> {
    const facility = new this.facilityModel(dto);
    return facility.save();
  }

  // ─── FIND ALL (paginated + filter) ───────────────────────────────────────────
  async findAll(query: QueryFacilityDto): Promise<{
    data: FacilityDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, status, isActive } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (status !== undefined) {
      filter.status = status;
    }
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.facilityModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      this.facilityModel.countDocuments(filter),
    ]);

    return {
      data: data as FacilityDocument[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── FIND ONE ─────────────────────────────────────────────────────────────────
  async findOne(id: string): Promise<FacilityDocument> {
    this.validateObjectId(id);
    const facility = await this.facilityModel.findById(id).lean();
    if (!facility) {
      throw new NotFoundException(`Không tìm thấy facility với id: ${id}`);
    }
    return facility as FacilityDocument;
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateFacilityDto): Promise<FacilityDocument> {
    this.validateObjectId(id);
    const updated = await this.facilityModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .lean();
    if (!updated) {
      throw new NotFoundException(`Không tìm thấy facility với id: ${id}`);
    }
    return updated as FacilityDocument;
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────────
  async remove(id: string): Promise<{ message: string }> {
    this.validateObjectId(id);
    const result = await this.facilityModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Không tìm thấy facility với id: ${id}`);
    }
    return { message: `Đã xóa facility "${result.name}" thành công` };
  }

  // ─── TOGGLE isActive ──────────────────────────────────────────────────────────
  async toggleActive(id: string): Promise<FacilityDocument> {
    this.validateObjectId(id);
    const facility = await this.facilityModel.findById(id);
    if (!facility) {
      throw new NotFoundException(`Không tìm thấy facility với id: ${id}`);
    }
    facility.isActive = !facility.isActive;
    return (await facility.save()).toObject() as FacilityDocument;
  }

  // ─── HELPER ───────────────────────────────────────────────────────────────────
  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`"${id}" không phải ObjectId hợp lệ`);
    }
  }
}