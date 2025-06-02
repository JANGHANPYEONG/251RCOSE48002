import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export type ProviderType = 'google' | 'kakao' | 'facebook';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  provider: ProviderType;

  @Column({ unique: true })
  walletAddress: string;

  @CreateDateColumn()
  createdAt: Date;
}
