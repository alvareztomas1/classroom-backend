import { MigrationInterface, QueryRunner } from "typeorm";

export class ReplacePurchasePaymentMethodRelationIntoColumn1754679993107 implements MigrationInterface {
    name = 'ReplacePurchasePaymentMethodRelationIntoColumn1754679993107'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP CONSTRAINT "FK_2d44d35774ef22e1a580ca062b2"`);
        await queryRunner.query(`ALTER TABLE "purchase" RENAME COLUMN "payment_method_id" TO "payment_method"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "payment_method"`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "payment_method" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "payment_method"`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "payment_method" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase" RENAME COLUMN "payment_method" TO "payment_method_id"`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD CONSTRAINT "FK_2d44d35774ef22e1a580ca062b2" FOREIGN KEY ("payment_method_id") REFERENCES "payment_method"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
