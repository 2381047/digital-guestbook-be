import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guest } from './guest.entity';
import { GuestController } from './guest.controller';
import { GuestService } from './guest.service';
import { EventModule } from '../event/event.module'; // Import EventModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Guest]),
    EventModule, // Import EventModule to use EventService
  ],
  controllers: [GuestController],
  providers: [GuestService],
  exports: [GuestService], // Export if needed by MessageModule
})
export class GuestModule {}
