import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // ConfigModule might be needed if not global
import { JwtModule } from '@nestjs/jwt'; // JWT Module already global
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../user/user.entity';
import { UserModule } from '../user/user.module'; // Import UserModule to use UserService

@Module({
  imports: [
    ConfigModule, // Ensure ConfigService is available if needed here
    UserModule, // Make UserService available for injection
    TypeOrmModule.forFeature([User]),
    // JwtModule is already global via AppModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // AuthGuard and RolesGuard are provided globally in AppModule
    // UserService is provided via UserModule export
  ],
  exports: [AuthService], // Export if needed elsewhere, usually not required
})
export class AuthModule {}
