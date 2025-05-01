import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EventModule } from './event/event.module';
import { GuestModule } from './guest/guest.module';
import { MessageModule } from './message/message.module';

import { User } from './user/user.entity';
import { Event } from './event/event.entity';
import { Guest } from './guest/guest.entity';
import { Message } from './message/message.entity';

import { AuthGuard } from './auth/auth.guard';
import { RolesGuard } from './auth/decorators/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // --- PERUBAHAN DI SINI ---
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('POSTGRES_HOST'); // Ambil host
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';

        return {
          type: 'postgres',
          // Hapus 'url'
          // url: configService.get<string>('DATABASE_URL'),

          // Gunakan variabel individual dari .env
          host: host,
          port: configService.get<number>('POSTGRES_PORT'),
          username: configService.get<string>('POSTGRES_USER'),
          password: configService.get<string>('POSTGRES_PASSWORD'),
          database: configService.get<string>('POSTGRES_DATABASE'),

          entities: [User, Event, Guest, Message], // Atau gunakan path: [__dirname + '/../**/*.entity{.ts,.js}']
          // autoLoadEntities: true, // Alternatif untuk entities

          migrations: [__dirname + '/migrations/*{.ts,.js}'], // Lokasi migrasi (biasanya tidak digunakan runtime)
          migrationsRun: false, // Jangan jalankan migrasi otomatis saat start

          synchronize: false, // HARUS false

          // Perbaiki Logika SSL: Aktif jika host BUKAN localhost
          ssl:
            host && host !== 'localhost'
              ? {
                  /**
                   * Sesuaikan rejectUnauthorized jika perlu.
                   * false seringkali dibutuhkan untuk koneksi lokal ke cloud DB.
                   * Anda bisa membuatnya configurable via .env jika mau:
                   * rejectUnauthorized: configService.get<string>('POSTGRES_SSL_REJECT_UNAUTHORIZED', 'false') === 'true'
                   */
                  rejectUnauthorized: false,
                }
              : false,

          // Logging bisa diatur berdasarkan NODE_ENV atau variabel lain
          logging: !isProduction, // Contoh: log SQL jika bukan production
        };
      },
    }),
    // --- AKHIR PERUBAHAN ---

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      global: true,
    }),
    AuthModule,
    UserModule,
    EventModule,
    GuestModule,
    MessageModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
