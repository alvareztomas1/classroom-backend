import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLessonTable1750184837874 implements MigrationInterface {
    name = 'AddLessonTable1750184837874'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "lesson" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "course_id" uuid NOT NULL, "section_id" uuid NOT NULL, "title" character varying, "description" text, "url" character varying, "lesson_type" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_0ef25918f0237e68696dee455bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "lesson" ADD CONSTRAINT "FK_a83099885c0ef3112edb9e12fd6" FOREIGN KEY ("section_id") REFERENCES "section"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lesson" DROP CONSTRAINT "FK_a83099885c0ef3112edb9e12fd6"`);
        await queryRunner.query(`DROP TABLE "lesson"`);
    }

}
