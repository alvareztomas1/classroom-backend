import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCourseIdForeignKeyToSectionTable1750087135143 implements MigrationInterface {
    name = 'AddCourseIdForeignKeyToSectionTable1750087135143'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "section" ADD CONSTRAINT "FK_7e12912705e3430a0bd74dad81f" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "section" DROP CONSTRAINT "FK_7e12912705e3430a0bd74dad81f"`);
    }

}
