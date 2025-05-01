import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateGuestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ example: 'Jane Smith', description: 'Name of the guest' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    example: 'jane.smith@example.com',
    description: 'Email of the guest',
  })
  email: string;

  @IsInt()
  @Min(1) // Ensure it's a positive integer
  @ApiProperty({
    example: 1,
    description: 'ID of the event the guest is associated with',
  })
  event_id: number;
}
