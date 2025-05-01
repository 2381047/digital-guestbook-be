import { Event } from '../event/event.entity';
import { Guest } from '../guest/guest.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('messages') // Table name 'messages'
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text') // Use 'text' for potentially longer messages
  content: string;

  @Column()
  guest_id: number; // Foreign key column

  @Column()
  event_id: number; // Foreign key column

  @ManyToOne(() => Guest, (guest) => guest.messages, {
    onDelete: 'CASCADE', // If a guest is deleted, delete their messages
    nullable: false,
  })
  @JoinColumn({ name: 'guest_id' })
  guest: Guest;

  @ManyToOne(() => Event, (event) => event.messages, {
    onDelete: 'CASCADE', // If an event is deleted, delete associated messages
    nullable: false,
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
