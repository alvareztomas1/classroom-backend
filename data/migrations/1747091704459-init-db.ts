import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDb1747091704459 implements MigrationInterface {
    name = 'InitDb1747091704459'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "external_id" character varying, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'regular', "is_verified" boolean NOT NULL DEFAULT false, "avatar_url" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_cace4a159ff9f2512dd42373760" UNIQUE ("id"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_d9479cbc9c65660b7cf9b657954" UNIQUE ("external_id"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
