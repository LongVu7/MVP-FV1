-- CreateEnum
CREATE TYPE "ProvinceGroup" AS ENUM ('HO_CHI_MINH', 'CORE_PROVINCE', 'OTHER_PROVINCE', 'FOREIGN');

-- CreateTable
CREATE TABLE "new_province" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "new_province_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "country" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(3),
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_education" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "school_id" INTEGER,
    "new_province_id" INTEGER,
    "country_id" INTEGER,
    "province_group" "ProvinceGroup",
    "school_type" "SchoolType",
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_education_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "new_province_name_key" ON "new_province"("name");

-- CreateIndex
CREATE UNIQUE INDEX "country_code_key" ON "country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "country_name_key" ON "country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "student_education_student_id_key" ON "student_education"("student_id");

-- CreateIndex
CREATE INDEX "student_education_school_id_idx" ON "student_education"("school_id");

-- CreateIndex
CREATE INDEX "student_education_new_province_id_idx" ON "student_education"("new_province_id");

-- CreateIndex
CREATE INDEX "student_education_country_id_idx" ON "student_education"("country_id");

-- AddForeignKey
ALTER TABLE "student_education" ADD CONSTRAINT "student_education_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_education" ADD CONSTRAINT "student_education_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "school"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_education" ADD CONSTRAINT "student_education_new_province_id_fkey" FOREIGN KEY ("new_province_id") REFERENCES "new_province"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_education" ADD CONSTRAINT "student_education_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DATA MIGRATION: Insert records into StudentEducation mapping student_id to school_id
INSERT INTO "student_education" ("student_id", "school_id")
SELECT "id", "school_id"
FROM "student";

-- DATA MIGRATION: Migrate schoolType from School table to StudentEducation by joining on school_id
UPDATE "student_education" se
SET "school_type" = s."school_type"
FROM "school" s
WHERE se."school_id" = s."id" AND s."school_type" IS NOT NULL;

-- Drop foreign keys and columns
ALTER TABLE "student" DROP CONSTRAINT IF EXISTS "student_school_id_fkey";
DROP INDEX IF EXISTS "student_school_id_idx";
ALTER TABLE "student" DROP COLUMN "school_id";

ALTER TABLE "school" DROP COLUMN "school_type";
