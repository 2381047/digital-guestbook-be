import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({
    example: 'Summer Picnic 2024',
    description: 'Title of the event',
  })
  title: string;

  @IsDateString() // Validates YYYY-MM-DD format
  @IsNotEmpty()
  @ApiProperty({
    example: '2024-08-15',
    description: 'Date of the event (YYYY-MM-DD)',
  })
  date: string; // Use string for simplicity with validation
}
