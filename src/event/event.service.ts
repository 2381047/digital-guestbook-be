import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    // Konversi tanggal sudah benar di sini
    const event = this.eventRepository.create({
      ...createEventDto,
      date: new Date(createEventDto.date), // Convert string to Date object
    });
    return this.eventRepository.save(event);
  }

  async findAll(): Promise<Event[]> {
    return this.eventRepository.find({ order: { date: 'DESC' } });
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  // --- PERUBAHAN DI SINI ---
  async update(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
    // 1. Dapatkan event yang ada atau lempar error jika tidak ditemukan
    const event = await this.findOne(id);

    // 2. Siapkan data untuk diupdate, pisahkan 'date' jika ada
    const { date: dateString, ...restOfDto } = updateEventDto;

    // 3. Buat objek data update awal dari sisa DTO
    const updatePayload: Partial<Event> = { ...restOfDto };

    // 4. Jika ada dateString, konversikan ke Date dan tambahkan ke payload
    if (dateString) {
      updatePayload.date = new Date(dateString);
    }

    // 5. Gabungkan perubahan ke entity yang ada
    // 'merge' akan mengambil properti dari updatePayload dan menimpakannya ke 'event'
    this.eventRepository.merge(event, updatePayload);

    // 6. Simpan entity yang sudah diperbarui
    return this.eventRepository.save(event);
  }
  // --- AKHIR PERUBAHAN ---

  async remove(id: number): Promise<void> {
    const result = await this.eventRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
  }
}
