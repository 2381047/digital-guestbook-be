import { Exclude } from 'class-transformer';
import { Message } from '../message/message.entity'; // Import Message entity if needed for relation
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index, // Import Index for unique constraints
  // OneToMany, // If User created Guests/Messages directly (not required by spec)
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  GUEST = 'guest', // Standard user role for registered guests who can log in
}

@Entity('users') // Table name 'users'
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true }) // Ensure email is unique at the DB level
  @Column({ length: 100 }) // Set a reasonable length
  email: string;

  @Column({ length: 100 }) // Set a reasonable length
  name: string;

  @Column()
  @Exclude() // Prevent password hash from being sent in responses
  password_hash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.GUEST, // Default role is guest
  })
  role: UserRole;

  @CreateDateColumn({ type: 'timestamp with time zone' }) // Use timestamptz
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' }) // Use timestamptz
  updated_at: Date;

  // Add relationships if needed (e.g., if a logged-in User *creates* Guests/Messages)
  // @OneToMany(() => Guest, guest => guest.creator) // Example if User created Guests
  // createdGuests: Guest[];
}
