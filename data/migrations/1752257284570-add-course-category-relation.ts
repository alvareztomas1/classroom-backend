import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCourseCategoryRelation1752257284570 implements MigrationInterface {
    name = 'AddCourseCategoryRelation1752257284570'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course" ADD "category_id" uuid`);
        await queryRunner.query(`ALTER TABLE "course" ADD CONSTRAINT "FK_2f133fd8aa7a4d85ff7cd6f7c98" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "FK_2f133fd8aa7a4d85ff7cd6f7c98"`);
        await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "category_id"`);
    }

}
