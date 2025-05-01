import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateGuestDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @ApiPropertyOptional({ example: 'Jane Smith-Doe' })
  name?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  @ApiPropertyOptional({ example: 'jane.doe@example.com' })
  email?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @ApiPropertyOptional({ example: 2 })
  event_id?: number;
}
