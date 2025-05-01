import { UserRole } from '../../user/user.entity'; // Adjust path

export class JwtPayloadDto {
  sub: number; // User ID
  email: string;
  role: UserRole; // Include role in the payload when signing
  iat?: number;
  exp?: number;
}
