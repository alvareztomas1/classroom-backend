import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInstructorIdToCourseSchema1750087496112 implements MigrationInterface {
    name = 'AddInstructorIdToCourseSchema1750087496112'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "FK_deca5c9911b3b2100b361060826"`);
        await queryRunner.query(`ALTER TABLE "course" ALTER COLUMN "instructor_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "course" ADD CONSTRAINT "FK_deca5c9911b3b2100b361060826" FOREIGN KEY ("instructor_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "FK_deca5c9911b3b2100b361060826"`);
        await queryRunner.query(`ALTER TABLE "course" ALTER COLUMN "instructor_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "course" ADD CONSTRAINT "FK_deca5c9911b3b2100b361060826" FOREIGN KEY ("instructor_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
