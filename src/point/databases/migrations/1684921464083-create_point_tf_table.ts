import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePointTFTable1684921464083 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
              name: 'point_tf',
              columns: [
                {
                  name: 'id',
                  type: 'int',
                  isPrimary: true,
                  isGenerated: true,
                  generationStrategy: 'increment',
                },
                {
                  name: 'point_id',
                  type: 'int',
                },
                {
                  name: 'x_price',
                  type: 'decimal',
                  precision: 20,
                  scale: 8,
                },
                {
                  name: 'a_price',
                  type: 'decimal',
                  precision: 20,
                  scale: 8,
                },
                {
                  name: 'b_price',
                  type: 'decimal',
                  precision: 20,
                  scale: 8,
                },
                {
                  name: 'c_price',
                  type: 'decimal',
                  precision: 20,
                  scale: 8,
                },
                {
                  name: 'd_price',
                  type: 'decimal',
                  precision: 20,
                  scale: 8,
                },
                {
                  name: 'tp1_price',
                  type: 'decimal',
                  precision: 20,
                  scale: 8,
                },
                {
                  name: 'tp2_price',
                  type: 'decimal',
                  precision: 20,
                  scale: 8,
                },
                {
                  name: 'tp3_price',
                  type: 'decimal',
                  precision: 20,
                  scale: 8,
                },
                {
                  name: 'st_price',
                  type: 'decimal',
                  precision: 20,
                  scale: 8,
                },
                {
                  name: 'tp1_fibonacci_level',
                  type: 'decimal',
                  precision: 5,
                  scale: 3,
                },
                {
                  name: 'tp2_fibonacci_level',
                  type: 'decimal',
                  precision: 5,
                  scale: 3,
                },
                {
                  name: 'tp3_fibonacci_level',
                  type: 'decimal',
                  precision: 5,
                  scale: 3,
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
              foreignKeys: [
                {
                  columnNames: ['point_id'],
                  referencedTableName: 'point',
                  referencedColumnNames: ['id'],
                  onDelete: 'CASCADE',
                }
              ]
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('point_tf');
    }
}