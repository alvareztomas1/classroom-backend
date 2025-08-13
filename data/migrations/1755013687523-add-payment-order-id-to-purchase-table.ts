import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentOrderIdToPurchaseTable1755013687523 implements MigrationInterface {
    name = 'AddPaymentOrderIdToPurchaseTable1755013687523'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" ADD "payment_order_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "payment_order_id"`);
    }

}
