import { IsOptional, IsString } from 'class-validator';

export class RevenueFilterDto {
  @IsOptional()
  @IsString()
  date?: string; // ISO date string (e.g. 2026-05-29) - used for daily/weekly/monthly anchor
}
