import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorPurchaseTableWithPaymentAndRefundIds1753884821371 implements MigrationInterface {
    name = 'RefactorPurchaseTableWithPaymentAndRefundIds1753884821371'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "external_id"`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "payment_transaction_id" character varying`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "refund_transaction_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "refund_transaction_id"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "payment_transaction_id"`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD "external_id" character varying`);
    }

}
