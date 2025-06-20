import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCourseTableValidations1750430092220 implements MigrationInterface {
    name = 'AddCourseTableValidations1750430092220'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "course" ADD "title" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "course" ADD "description" character varying(2000)`);
        await queryRunner.query(`ALTER TABLE "course" ALTER COLUMN "price" TYPE numeric(10,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course" ALTER COLUMN "price" TYPE numeric(2,0)`);
        await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "course" ADD "description" character varying`);
        await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "course" ADD "title" character varying NOT NULL`);
    }

}
