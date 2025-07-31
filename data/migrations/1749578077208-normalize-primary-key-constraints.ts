import { MigrationInterface, QueryRunner } from "typeorm";

export class NormalizePrimaryKeyConstraints1749578077208 implements MigrationInterface {
    name = 'NormalizePrimaryKeyConstraints1749578077208'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "FK_deca5c9911b3b2100b361060826"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_cace4a159ff9f2512dd42373760"`);
        await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "UQ_bf95180dd756fd204fb01ce4916"`);
        await queryRunner.query(`ALTER TABLE "course" ADD CONSTRAINT "FK_deca5c9911b3b2100b361060826" FOREIGN KEY ("instructor_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "FK_deca5c9911b3b2100b361060826"`);
        await queryRunner.query(`ALTER TABLE "course" ADD CONSTRAINT "UQ_bf95180dd756fd204fb01ce4916" UNIQUE ("id")`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_cace4a159ff9f2512dd42373760" UNIQUE ("id")`);
        await queryRunner.query(`ALTER TABLE "course" ADD CONSTRAINT "FK_deca5c9911b3b2100b361060826" FOREIGN KEY ("instructor_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
