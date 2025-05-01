import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { GuestModule } from '../guest/guest.module'; // Import GuestModule
import { EventModule } from '../event/event.module'; // Import EventModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    GuestModule, // To verify guest_id
    EventModule, // To verify event_id
  ],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
