import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSlugToCourseTable1748284919579 implements MigrationInterface {
    name = 'AddSlugToCourseTable1748284919579'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course" ADD "slug" character varying`);
        await queryRunner.query(`ALTER TABLE "course" ADD CONSTRAINT "UQ_a101f48e5045bcf501540a4a5b8" UNIQUE ("slug")`);
        await queryRunner.query(`ALTER TABLE "course" ADD CONSTRAINT "UQ_bf95180dd756fd204fb01ce4916" UNIQUE ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "UQ_bf95180dd756fd204fb01ce4916"`);
        await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "UQ_a101f48e5045bcf501540a4a5b8"`);
        await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "slug"`);
    }

}
