// facility-response.dto.ts

export class FacilityItemDto {
  id?: string;
  name: string;
  image: string;
  userId: string;
  avatar: string;
  status: string;
  openTime: string;
  closeTime: string;
  address: string;
}

export class FacilityListResponseDto {
  data?: FacilityItemDto[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
