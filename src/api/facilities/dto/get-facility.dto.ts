import { IsOptional, IsNumberString } from 'class-validator';

export class GetFacilityDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
