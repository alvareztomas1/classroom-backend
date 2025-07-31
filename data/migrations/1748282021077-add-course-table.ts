import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCourseTable1748282021077 implements MigrationInterface {
    name = 'AddCourseTable1748282021077'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "course" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, "price" numeric(2), "image_url" character varying, "status" character varying NOT NULL DEFAULT 'drafted', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_bf95180dd756fd204fb01ce4916" UNIQUE ("id"), CONSTRAINT "PK_bf95180dd756fd204fb01ce4916" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "course"`);
    }

}
