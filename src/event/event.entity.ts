import { Guest } from '../guest/guest.entity';
import { Message } from '../message/message.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany, // Import OneToMany
} from 'typeorm';

@Entity('events') // Table name 'events'
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'date' }) // Store only the date
  date: Date; // Or string, depending on how you handle dates

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Inverse side of the relationships
  @OneToMany(() => Guest, (guest) => guest.event)
  guests: Guest[];

  @OneToMany(() => Message, (message) => message.event)
  messages: Message[];
}
