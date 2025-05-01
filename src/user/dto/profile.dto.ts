import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../user.entity';

export class ProfileDTO {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'guest', enum: UserRole })
  role: UserRole;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
