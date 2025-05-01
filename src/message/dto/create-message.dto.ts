import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000) // Example max length
  @ApiProperty({
    example: 'Had a wonderful time!',
    description: 'Content of the message',
  })
  content: string;

  @IsInt()
  @Min(1)
  @ApiProperty({
    example: 1,
    description: 'ID of the guest leaving the message',
  })
  guest_id: number;

  @IsInt()
  @Min(1)
  @ApiProperty({
    example: 1,
    description: 'ID of the event the message is associated with',
  })
  event_id: number;
}
