import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException, // Import BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto'; // Pastikan ini diimport
import { UpdateUserDto } from './dto/update-user.dto';

// Helper function type guard (opsional, tapi bisa berguna)
// function hasPassword(dto: any): dto is { password: string } {
//   return typeof dto?.password === 'string' && dto.password.length > 0;
// }

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOneById(id: number): Promise<User | null> {
    // Sebaiknya gunakan findOneBy untuk kejelasan
    return this.userRepository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    // Tambahkan validasi dasar jika email kosong/null, meskipun DTO seharusnya mencegahnya
    if (!email) {
      // Ini seharusnya tidak terjadi jika validasi DTO bekerja, tapi sebagai pengaman
      console.warn('findByEmail dipanggil dengan email kosong atau null');
      return null;
    }
    return this.userRepository.findOneBy({ email });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'name', 'email', 'role', 'created_at', 'updated_at'],
    });
  }

  // --- PERUBAHAN SIGNATURE & VALIDASI INTERNAL ---
  async create(
    createUserDto: CreateUserDto, // Gunakan DTO spesifik yang mewajibkan field
  ): Promise<Omit<User, 'password_hash'>> {
    // Validasi email (meskipun findByEmail juga melakukannya, lebih baik cek di awal)
    if (!createUserDto.email) {
      throw new BadRequestException('Email is required.');
    }
    // Panggil findByEmail setelah memastikan email ada
    const existingUser = await this.findByEmail(createUserDto.email); // Error TS2345 hilang di sini
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Pastikan password ada (CreateUserDto sudah mewajibkannya via decorator)
    if (!createUserDto.password) {
      throw new BadRequestException('Password is required.'); // Pengaman tambahan
    }

    // Buat entity, TypeORM create tidak menyimpan, hanya membuat instance
    const user = this.userRepository.create(createUserDto);

    // Hash password
    user.password_hash = await bcrypt.hash(createUserDto.password, 10);

    // Set role (jika tidak ada di DTO, default sudah di handle oleh entity atau set manual di sini)
    if (!user.role) {
      // Jika DTO opsional dan tidak menyediakan, set default
      user.role = UserRole.GUEST;
    }

    try {
      // Simpan user ke database
      const savedUser = await this.userRepository.save(user);

      // Buat objek baru tanpa password_hash untuk dikembalikan
      const { password_hash, ...userToReturn } = savedUser;
      return userToReturn;
    } catch (error) {
      console.error('User creation error:', error);
      // Handle potensi error spesifik dari DB jika perlu
      throw new InternalServerErrorException('Could not create user');
    }
  }
  // --- AKHIR PERUBAHAN ---

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    performingUserRole: UserRole,
  ): Promise<Omit<User, 'password_hash'>> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Role change check
    if (updateUserDto.role && performingUserRole !== UserRole.ADMIN) {
      throw new ConflictException('Only admins can change user roles.');
    }

    // Email uniqueness check
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already exists for another user');
      }
    }

    // Siapkan payload update, hash password jika ada
    const { password, ...safeUpdateDto } = updateUserDto; // Pisahkan password
    const finalUpdatePayload: Partial<User> = { ...safeUpdateDto }; // Mulai dengan DTO yang aman

    if (password) {
      // Jika password baru disediakan
      finalUpdatePayload.password_hash = await bcrypt.hash(password, 10);
    }

    // Merge perubahan ke entity yang ada
    this.userRepository.merge(user, finalUpdatePayload);

    try {
      const updatedUser = await this.userRepository.save(user);
      // Buat objek baru tanpa password_hash
      const { password_hash, ...userToReturn } = updatedUser;
      return userToReturn;
    } catch (error) {
      console.error('User update error:', error);
      throw new InternalServerErrorException('Could not update user');
    }
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
