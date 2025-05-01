import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { GuestService } from '../guest/guest.service'; // Import GuestService
import { EventService } from '../event/event.service'; // Import EventService

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private guestService: GuestService, // Inject GuestService
    private eventService: EventService, // Inject EventService
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    // Verify guest and event exist
    try {
      await this.guestService.findOne(createMessageDto.guest_id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException(
          `Guest with ID ${createMessageDto.guest_id} does not exist.`,
        );
      }
      throw error;
    }
    try {
      await this.eventService.findOne(createMessageDto.event_id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException(
          `Event with ID ${createMessageDto.event_id} does not exist.`,
        );
      }
      throw error;
    }

    // Optional: Verify guest belongs to the event before allowing message?
    // const guest = await this.guestService.findOne(createMessageDto.guest_id);
    // if (guest.event_id !== createMessageDto.event_id) {
    //    throw new BadRequestException(`Guest ${createMessageDto.guest_id} is not associated with event ${createMessageDto.event_id}.`);
    // }

    const message = this.messageRepository.create(createMessageDto);
    return this.messageRepository.save(message);
  }

  async findAll(): Promise<Message[]> {
    return this.messageRepository.find({
      relations: ['guest', 'event'], // Load related guest and event
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: ['guest', 'event'],
    });
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return message;
  }

  async update(
    id: number,
    updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    const message = await this.findOne(id); // Handles not found
    // Note: We're not validating guest_id/event_id changes here as they are typically not updated.

    this.messageRepository.merge(message, updateMessageDto);
    return this.messageRepository.save(message);
  }

  async remove(id: number): Promise<void> {
    const result = await this.messageRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
  }
}
