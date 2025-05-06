import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePointTable1684921464082 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
              name: 'point',
              columns: [
                {
                  name: 'id',
                  type: 'int',
                  isPrimary: true,
                  isGenerated: true,
                  generationStrategy: 'increment',
                },
                {
                  name: 'symbol',
                  type: 'varchar',
                },
                {
                  name: 'interval',
                  type: 'varchar',
                },
                {
                  name: 'pattern_type',
                  type: 'varchar', // CYPHER, BAT, etc.
                },
                {
                  name: 'trend_type',
                  type: 'varchar', // BULLISH, BEARISH
                },
                {
                  name: 'point_type',
                  type: 'varchar', // C, D
                },
                {
                  name: 'price',
                  type: 'decimal',
                  precision: 20,
                  scale: 8,
                },
                {
                  name: 'open_time',
                  type: 'bigint',
                },
                {
                  name: 'index',
                  type: 'int',
                },
                {
                  name: 'status',
                  type: 'int', // 1: đang hoàn thành, 2: đã hoàn thành, 3: TP1, 4: TP2, 5: TP3, 6: ST
                },
                {
                  name: 'x_price_id',
                  type: 'int',
                  isNullable: true,
                },
                {
                  name: 'a_price_id', 
                  type: 'int',
                  isNullable: true,
                },
                {
                  name: 'b_price_id',
                  type: 'int', 
                  isNullable: true,
                },
                {
                  name: 'd_predicted_price',
                  type: 'decimal',
                  precision: 20,
                  scale: 8,
                  isNullable: true,
                },
                {
                  name: 'tp1_price',
                  type: 'decimal',
                  precision: 20,
                  scale: 8,
                  isNullable: true,
                },
                {
                  name: 'tp2_price',
                  type: 'decimal',
                  precision: 20,
                  scale: 8,
                  isNullable: true,
                },
                {
                  name: 'tp3_price',
                  type: 'decimal',
                  precision: 20,
                  scale: 8,
                  isNullable: true,
                },
                {
                  name: 'st_price',
                  type: 'decimal',
                  precision: 20,
                  scale: 8,
                  isNullable: true,
                },
                {
                  name: 'created_at',
                  type: 'timestamp',
                  default: 'CURRENT_TIMESTAMP',
                },
                {
                  name: 'updated_at',
                  type: 'timestamp', 
                  default: 'CURRENT_TIMESTAMP',
                },
              ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('point');
    }
}