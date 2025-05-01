import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User, UserRole } from '../user/user.entity';
import { RegisterDTO } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { LoginDTO } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(loginDto: LoginDTO): Promise<{ access_token: string }> {
    const user = await this.userService.findByEmail(loginDto.email);

    // Penting: Periksa apakah user ditemukan SEBELUM mengakses password_hash
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatching = await bcrypt.compare(
      loginDto.password,
      user.password_hash, // Akses hash hanya jika user ditemukan
    );

    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayloadDto = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  // --- PERUBAHAN SIGNATURE & DI DALAM FUNGSI REGISTER ---
  async register(
    registerDto: RegisterDTO,
  ): Promise<Omit<User, 'password_hash'>> {
    // Return type Omit<>
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new HttpException(
        'Email already exists',
        HttpStatus.CONFLICT, // 409 Conflict
      );
    }

    // Kita tidak perlu membuat instance User baru di sini karena userService.create akan melakukannya
    // const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    // const newUser = new User();
    // newUser.name = registerDto.name;
    // newUser.email = registerDto.email;
    // newUser.password_hash = hashedPassword; // Hashing akan ditangani oleh userService
    // newUser.role = UserRole.GUEST; // Default role juga ditangani userService

    try {
      // Langsung panggil userService.create dengan DTO register.
      // Asumsi RegisterDTO kompatibel atau sama dengan CreateUserDto
      // Jika berbeda, Anda perlu memetakan field dari RegisterDTO ke CreateUserDto
      const savedUser = await this.userService.create(registerDto); // userService.create sudah mengembalikan Omit<>

      // Baris ini tidak diperlukan lagi karena savedUser sudah tidak punya password_hash
      // const { password_hash, ...result } = savedUser; // <-- HAPUS/KOMENTARI BARIS INI

      return savedUser; // Kembalikan langsung savedUser yang sudah bersih
    } catch (error) {
      console.error('Registration Error:', error);
      // Re-throw error spesifik jika berasal dari userService (misal ConflictException)
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Could not register user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // --- AKHIR PERUBAHAN ---
}
