import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

// Memuat variabel dari file .env
dotenv.config();

// Validasi sederhana apakah variabel penting sudah terdefinisi
const requiredEnvVars = [
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.warn(
      `PERINGATAN: Environment variable ${varName} tidak ditemukan. Koneksi database mungkin gagal.`,
    );
  }
});

const config: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,

  // --- PERUBAHAN DI SINI ---
  // Aktifkan SSL jika POSTGRES_HOST ada dan BUKAN 'localhost'
  // Ini akan memastikan SSL digunakan saat terhubung ke database cloud Anda.
  ssl:
    process.env.POSTGRES_HOST && process.env.POSTGRES_HOST !== 'localhost'
      ? {
          /**
           * `rejectUnauthorized: false` seringkali diperlukan untuk terhubung ke layanan
           * database cloud (seperti Neon, Heroku Postgres, Vercel Postgres) dari lingkungan lokal
           * atau beberapa platform hosting, terutama pada tier gratis/pengembangan.
           * Untuk production yang sebenarnya, idealnya Anda harus menggunakan sertifikat CA
           * dan mengatur ini ke `true` atau menghapusnya (defaultnya true), tapi `false`
           * seringkali menjadi solusi praktis untuk memulai.
           * Periksa dokumentasi provider database Anda untuk rekomendasi spesifik mereka.
           */
          rejectUnauthorized: false,
        }
      : false, // Jangan gunakan SSL jika host adalah 'localhost' (atau tidak diset)

  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
  migrationsTableName: 'migrations_typeorm',
};

export default new DataSource(config);

// Anda bisa menambahkan console log di sini untuk debugging nilai environment saat dijalankan
// console.log('Konfigurasi DataSource:', {
//   host: config.host,
//   port: config.port,
//   username: config.username,
//   database: config.database,
//   ssl_config: config.ssl, // Lihat konfigurasi SSL yang diterapkan
// });
