import { PartialType } from '@nestjs/swagger';
import { CreateHeaderBannerDto } from './create-header-banner.dto';

export class UpdateHeaderBannerDto extends PartialType(CreateHeaderBannerDto) {}