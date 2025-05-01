import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guest } from './guest.entity';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { EventService } from '../event/event.service'; // Import EventService

@Injectable()
export class GuestService {
  constructor(
    @InjectRepository(Guest)
    private guestRepository: Repository<Guest>,
    private eventService: EventService, // Inject EventService
  ) {}

  async create(createGuestDto: CreateGuestDto): Promise<Guest> {
    // Verify the event exists before creating the guest
    try {
      await this.eventService.findOne(createGuestDto.event_id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException(
          `Event with ID ${createGuestDto.event_id} does not exist.`,
        );
      }
      throw error; // Re-throw other errors
    }

    const guest = this.guestRepository.create(createGuestDto);
    return this.guestRepository.save(guest);
  }

  async findAll(): Promise<Guest[]> {
    return this.guestRepository.find({
      relations: ['event'],
      order: { created_at: 'DESC' },
    }); // Load related event
  }

  async findOne(id: number): Promise<Guest> {
    const guest = await this.guestRepository.findOne({
      where: { id },
      relations: ['event'], // Load related event
    });
    if (!guest) {
      throw new NotFoundException(`Guest with ID ${id} not found`);
    }
    return guest;
  }

  async update(id: number, updateGuestDto: UpdateGuestDto): Promise<Guest> {
    const guest = await this.findOne(id); // Handles not found

    // If event_id is being updated, verify the new event exists
    if (updateGuestDto.event_id && updateGuestDto.event_id !== guest.event_id) {
      try {
        await this.eventService.findOne(updateGuestDto.event_id);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException(
            `Event with ID ${updateGuestDto.event_id} does not exist.`,
          );
        }
        throw error;
      }
    }

    this.guestRepository.merge(guest, updateGuestDto);
    return this.guestRepository.save(guest);
  }

  async remove(id: number): Promise<void> {
    const result = await this.guestRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Guest with ID ${id} not found`);
    }
  }
}
