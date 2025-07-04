import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategorySelfRelation1751491140318 implements MigrationInterface {
    name = 'AddCategorySelfRelation1751491140318'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" ADD "parent_id" uuid`);
        await queryRunner.query(`ALTER TABLE "category" ADD CONSTRAINT "UQ_CATEGORY_PARENT_NAME" UNIQUE ("name", "parent_id")`);
        await queryRunner.query(`ALTER TABLE "category" ADD CONSTRAINT "FK_1117b4fcb3cd4abb4383e1c2743" FOREIGN KEY ("parent_id") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "FK_1117b4fcb3cd4abb4383e1c2743"`);
        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "UQ_CATEGORY_PARENT_NAME"`);
        await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "parent_id"`);
    }

}
