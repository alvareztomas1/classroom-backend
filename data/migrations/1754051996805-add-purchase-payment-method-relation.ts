import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPurchasePaymentMethodRelation1754051996805 implements MigrationInterface {
    name = 'AddPurchasePaymentMethodRelation1754051996805'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" ADD "payment_method_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD CONSTRAINT "FK_2d44d35774ef22e1a580ca062b2" FOREIGN KEY ("payment_method_id") REFERENCES "payment_method"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP CONSTRAINT "FK_2d44d35774ef22e1a580ca062b2"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "payment_method_id"`);
    }

}
