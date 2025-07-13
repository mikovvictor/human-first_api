import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('signatures')
export class Signature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  country: string | null;

  @Column({ default: false })
  newsletterSubscribed: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true, type: 'varchar' })  
  otpCode: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  otpExpiresAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
