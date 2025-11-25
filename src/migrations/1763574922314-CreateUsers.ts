import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsers1763574922314 implements MigrationInterface {
    name = 'CreateUsers1763574922314'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "twoFactorAuthenticationSecret" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "isTwoFactorAuthenticationEnabled" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isTwoFactorAuthenticationEnabled"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twoFactorAuthenticationSecret"`);
    }

}
