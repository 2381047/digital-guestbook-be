import { Event } from '../event/event.entity';
import { Message } from '../message/message.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne, // Import ManyToOne
  JoinColumn, // Import JoinColumn
  OneToMany,
  Index,
} from 'typeorm';

@Entity('guests') // Table name 'guests'
export class Guest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Index() // Index email for faster lookups if needed
  @Column({ length: 100 })
  email: string;

  @Column()
  event_id: number; // Foreign key column

  @ManyToOne(() => Event, (event) => event.guests, {
    onDelete: 'CASCADE', // If an event is deleted, delete associated guests
    nullable: false, // An event is required
  })
  @JoinColumn({ name: 'event_id' }) // Specify the foreign key column name
  event: Event;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Inverse side of the relationship
  @OneToMany(() => Message, (message) => message.guest)
  messages: Message[];
}
