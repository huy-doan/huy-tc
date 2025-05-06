
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Point } from './point.entity';

@Entity('point_tf')
export class PointTF {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  point_id: number;

  @Column('decimal', { precision: 20, scale: 8 })
  x_price: number;

  @Column('decimal', { precision: 20, scale: 8 })
  a_price: number;

  @Column('decimal', { precision: 20, scale: 8 })
  b_price: number;

  @Column('decimal', { precision: 20, scale: 8 })
  c_price: number;

  @Column('decimal', { precision: 20, scale: 8 })
  d_price: number;

  @Column('decimal', { precision: 20, scale: 8 })
  tp1_price: number;

  @Column('decimal', { precision: 20, scale: 8 })
  tp2_price: number;

  @Column('decimal', { precision: 20, scale: 8 })
  tp3_price: number;

  @Column('decimal', { precision: 20, scale: 8 })
  st_price: number;

  @Column('decimal', { precision: 5, scale: 3 })
  tp1_fibonacci_level: number;

  @Column('decimal', { precision: 5, scale: 3 })
  tp2_fibonacci_level: number;

  @Column('decimal', { precision: 5, scale: 3 })
  tp3_fibonacci_level: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Point, point => point.point_tfs)
  @JoinColumn({ name: 'point_id' })
  point: Point;
}