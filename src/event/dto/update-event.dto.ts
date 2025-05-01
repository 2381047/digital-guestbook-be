import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @ApiPropertyOptional({ example: 'Annual Gala 2024' })
  title?: string;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({ example: '2024-12-01' })
  date?: string;
}
