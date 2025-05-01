import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../user.entity';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  @ApiPropertyOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  @ApiPropertyOptional({ description: 'New password (min 6 characters)' })
  password?: string;

  @IsEnum(UserRole)
  @IsOptional()
  @ApiPropertyOptional({
    enum: UserRole,
    description: 'Only updatable by Admin',
  })
  role?: UserRole;
}
