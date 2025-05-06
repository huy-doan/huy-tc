
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PointTF } from './point-tf.entity';

export enum PointStatus {
  PROCESSING = 1,
  COMPLETED = 2,
  TP1 = 3,
  TP2 = 4,
  TP3 = 5,
  ST = 6,
}

export enum PointType {
  C = 'C',
  D = 'D',
}

export enum TrendType {
  BULLISH = 'BULLISH',
  BEARISH = 'BEARISH',
}

@Entity('point')
export class Point {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  symbol: string;

  @Column()
  interval: string;

  @Column()
  pattern_type: string;

  @Column()
  trend_type: TrendType;

  @Column()
  point_type: PointType;

  @Column('decimal', { precision: 20, scale: 8 })
  price: number;

  @Column('bigint')
  open_time: number;

  @Column('int')
  index: number;

  @Column('int')
  status: PointStatus;

  @Column('int', { nullable: true })
  x_price_id: number;

  @Column('int', { nullable: true })
  a_price_id: number;

  @Column('int', { nullable: true })
  b_price_id: number;

  @Column('decimal', { precision: 20, scale: 8, nullable: true })
  d_predicted_price: number;

  @Column('decimal', { precision: 20, scale: 8, nullable: true })
  tp1_price: number;

  @Column('decimal', { precision: 20, scale: 8, nullable: true })
  tp2_price: number;

  @Column('decimal', { precision: 20, scale: 8, nullable: true })
  tp3_price: number;

  @Column('decimal', { precision: 20, scale: 8, nullable: true })
  st_price: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => PointTF, pointTF => pointTF.point)
  point_tfs: PointTF[];
}