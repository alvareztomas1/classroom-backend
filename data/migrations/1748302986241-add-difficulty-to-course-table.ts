import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDifficultyToCourseTable1748302986241 implements MigrationInterface {
    name = 'AddDifficultyToCourseTable1748302986241'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course" ADD "difficulty" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "difficulty"`);
    }

}
