import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMessageDto {
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  @ApiPropertyOptional({ example: 'Corrected message content.' })
  content?: string;

  // Typically guest_id and event_id wouldn't be updated, but included if needed
  // @IsInt()
  // @Min(1)
  // @IsOptional()
  // @ApiPropertyOptional()
  // guest_id?: number;

  // @IsInt()
  // @Min(1)
  // @IsOptional()
  // @ApiPropertyOptional()
  // event_id?: number;
}
