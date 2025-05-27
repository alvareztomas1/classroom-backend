import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInstructorRelationToCourseTable1748310859253 implements MigrationInterface {
    name = 'AddInstructorRelationToCourseTable1748310859253'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course" ADD "instructor_id" uuid`);
        await queryRunner.query(`ALTER TABLE "course" ADD CONSTRAINT "FK_deca5c9911b3b2100b361060826" FOREIGN KEY ("instructor_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "FK_deca5c9911b3b2100b361060826"`);
        await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "instructor_id"`);
    }

}
