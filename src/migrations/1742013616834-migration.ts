import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1742013616834 implements MigrationInterface {
  name = 'Migration1742013616834';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "post_likes" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "postId" integer, "userId" integer, CONSTRAINT "PK_e4ac7cb9daf243939c6eabb2e0d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."materials_category_enum" AS ENUM('PLASTIC', 'PAPER', 'METAL', 'GLASS', 'TEXTILE', 'ORGANIC', 'ELECTRONIC', 'BATTERY', 'OTHER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."materials_unit_enum" AS ENUM('KG', 'G', 'L', 'ML', 'PIECE', 'PACK', 'BOTTLE', 'SPOON')`,
    );
    await queryRunner.query(
      `CREATE TABLE "materials" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "name" character varying NOT NULL, "weightPerUnit" numeric(10,2), "environmentalImpact" integer NOT NULL DEFAULT '0', "category" "public"."materials_category_enum" NOT NULL DEFAULT 'OTHER', "unit" "public"."materials_unit_enum" NOT NULL DEFAULT 'G', CONSTRAINT "PK_2fd1a93ecb222a28bef28663fa0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "post_materials" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "quantity" integer NOT NULL, "totalWeight" numeric(10,2) NOT NULL DEFAULT '0', "post_id" integer, "material_id" integer, CONSTRAINT "PK_f12cb3b1ecd6c927c78fc3a86b9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."posts_posttype_enum" AS ENUM('IMAGE', 'VIDEO', 'YOUTUBE_URL')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."posts_postdifficulty_enum" AS ENUM('EASY', 'MEDIUM', 'HARD')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."posts_poststatus_enum" AS ENUM('PENDING', 'PUBLISH', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "posts" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "title" character varying NOT NULL, "description" character varying, "estimatedTime" character varying, "imageUrls" text array NOT NULL DEFAULT '{}', "thumbnailUrl" character varying NOT NULL, "viewCount" integer NOT NULL DEFAULT '0', "completionCount" integer NOT NULL DEFAULT '0', "likeCount" integer NOT NULL DEFAULT '0', "postType" "public"."posts_posttype_enum" NOT NULL DEFAULT 'IMAGE', "postDifficulty" "public"."posts_postdifficulty_enum" DEFAULT 'EASY', "postStatus" "public"."posts_poststatus_enum" DEFAULT 'PENDING', "userId" integer, CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "post_completions" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "completedAt" TIMESTAMP, "postId" integer, "userId" integer, CONSTRAINT "PK_245f65be50afc12558b00ba8b8b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "post_bookmarks" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "date" TIMESTAMP NOT NULL DEFAULT now(), "collectionId" integer, "postId" integer, CONSTRAINT "PK_5dd9a87ec9317ecc59b3cf0ef9d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bookmark_collections" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "name" character varying NOT NULL, "description" character varying, "isPrivate" boolean NOT NULL DEFAULT true, "UserId" integer, CONSTRAINT "PK_969e03b4c7daf98b0d44d8ba6eb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'USER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "firstName" character varying(30), "lastName" character varying(30), "username" character varying NOT NULL, "email" character varying(40) NOT NULL, "password" character varying NOT NULL, "profileImageUrl" character varying, "bio" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER', "hashedRefreshToken" character varying, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "comments" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "content" text NOT NULL, "user_id" integer NOT NULL, "post_id" integer NOT NULL, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" ADD CONSTRAINT "FK_6999d13aca25e33515210abaf16" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" ADD CONSTRAINT "FK_37d337ad54b1aa6b9a44415a498" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_materials" ADD CONSTRAINT "FK_86abcb7b5df8dce6d3045bedbe7" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_materials" ADD CONSTRAINT "FK_c2c432782d411c776586cbebac4" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_ae05faaa55c866130abef6e1fee" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_completions" ADD CONSTRAINT "FK_9d7dd5ae59cf785c9d64d05c105" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_completions" ADD CONSTRAINT "FK_08d551f31f683a3a28364ef8618" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_bookmarks" ADD CONSTRAINT "FK_a17d939fe8c7ccc8ee42d42dbaf" FOREIGN KEY ("collectionId") REFERENCES "bookmark_collections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_bookmarks" ADD CONSTRAINT "FK_00c6a8c7a2c3e49c229250bc12f" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookmark_collections" ADD CONSTRAINT "FK_405b93df12b32206abcd74e8054" FOREIGN KEY ("UserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_259bf9825d9d198608d1b46b0b5" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_259bf9825d9d198608d1b46b0b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookmark_collections" DROP CONSTRAINT "FK_405b93df12b32206abcd74e8054"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_bookmarks" DROP CONSTRAINT "FK_00c6a8c7a2c3e49c229250bc12f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_bookmarks" DROP CONSTRAINT "FK_a17d939fe8c7ccc8ee42d42dbaf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_completions" DROP CONSTRAINT "FK_08d551f31f683a3a28364ef8618"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_completions" DROP CONSTRAINT "FK_9d7dd5ae59cf785c9d64d05c105"`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_ae05faaa55c866130abef6e1fee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_materials" DROP CONSTRAINT "FK_c2c432782d411c776586cbebac4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_materials" DROP CONSTRAINT "FK_86abcb7b5df8dce6d3045bedbe7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" DROP CONSTRAINT "FK_37d337ad54b1aa6b9a44415a498"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" DROP CONSTRAINT "FK_6999d13aca25e33515210abaf16"`,
    );
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TABLE "bookmark_collections"`);
    await queryRunner.query(`DROP TABLE "post_bookmarks"`);
    await queryRunner.query(`DROP TABLE "post_completions"`);
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(`DROP TYPE "public"."posts_poststatus_enum"`);
    await queryRunner.query(`DROP TYPE "public"."posts_postdifficulty_enum"`);
    await queryRunner.query(`DROP TYPE "public"."posts_posttype_enum"`);
    await queryRunner.query(`DROP TABLE "post_materials"`);
    await queryRunner.query(`DROP TABLE "materials"`);
    await queryRunner.query(`DROP TYPE "public"."materials_unit_enum"`);
    await queryRunner.query(`DROP TYPE "public"."materials_category_enum"`);
    await queryRunner.query(`DROP TABLE "post_likes"`);
  }
}
