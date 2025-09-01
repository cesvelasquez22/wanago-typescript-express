import { MigrationInterface, QueryRunner } from "typeorm";

export class UserFullName1756761449448 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user"
            RENAME "name" TO "fullName";
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user"
            RENAME "fullName" TO "name";
        `);
  }
}
