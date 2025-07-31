import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPurchaseTable1753108245945 implements MigrationInterface {
    name = 'AddPurchaseTable1753108245945'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "purchase" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL, "course_id" uuid NOT NULL, "amount" numeric(10,2), "status" character varying NOT NULL, "external_id" character varying, CONSTRAINT "PK_86cc2ebeb9e17fc9c0774b05f69" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "purchase"`);
    }

}
