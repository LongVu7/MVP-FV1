-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('EMAIL', 'SMS', 'ZNS');

-- CreateEnum
CREATE TYPE "CampaignTemplateStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ErrorReportStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

-- CreateEnum
CREATE TYPE "Regional" AS ENUM ('kv1', 'kv2', 'kv3', 'kv4', 'kv5', 'kv6');

-- CreateEnum
CREATE TYPE "MajorLevel" AS ENUM ('interestedMajor', 'specificMajor');

-- CreateEnum
CREATE TYPE "SourceLevel" AS ENUM ('source', 'sourceDetail', 'approachMethod');

-- CreateEnum
CREATE TYPE "EnglishCertificate" AS ENUM ('IELTS', 'TOEFL', 'TOEIC', 'VSTEP', 'APTIS', 'LINGUASKILL', 'PEIC', 'CAMBRIDGE_EXAM', 'PTE', 'other');

-- CreateEnum
CREATE TYPE "GPA" AS ENUM ('LOWER_21', 'GRADE_11_FROM_21_TO_23', 'GRADE_12_CUR_2_FROM_24_TO_25', 'GRADE_12_FROM_21_TO_23', 'GRADE_11_FROM_24_TO_26', 'GRADE_12_FROM_24_TO_26', 'GRADE_11_HIGHER_26', 'GRADE_12_CUR_1_HIGHER_26', 'GRADE_12_HIGHER_26');

-- CreateEnum
CREATE TYPE "ProgramScore" AS ENUM ('MATH_G11_HIGHER_7', 'MATH_G11_CUR1_HIGHER_7', 'MATH_G12_HIGHER_7', 'PHY_G11_HIGHER_7', 'PHY_G12_CUR1_HIGHER_7', 'PHY_G12_HIGHER_7', 'CHEM_G11_HIGHER_7', 'CHEM_G12_CUR1_HIGHER_7', 'CHEM_G12_HIGHER_7');

-- CreateEnum
CREATE TYPE "StatusLevel" AS ENUM ('interaction', 'general', 'detail');

-- CreateEnum
CREATE TYPE "ProvinceGroup" AS ENUM ('HO_CHI_MINH', 'CORE_PROVINCE', 'OTHER_PROVINCE', 'FOREIGN');

-- CreateEnum
CREATE TYPE "SchoolType" AS ENUM ('A_STAR', 'A', 'B', 'C', 'D');

-- CreateTable
CREATE TABLE "account" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER,
    "group_id" INTEGER,
    "password" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "owner_id" INTEGER NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_by_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_activity" (
    "id" SERIAL NOT NULL,
    "campaign_id" INTEGER NOT NULL,
    "type" "ActivityType" NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(255),
    "content" TEXT,
    "template_id" INTEGER,
    "status" VARCHAR(50) NOT NULL DEFAULT 'draft',
    "scheduled_at" TIMESTAMP(3),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_recipient" (
    "id" SERIAL NOT NULL,
    "activity_id" INTEGER NOT NULL,
    "inquiry_id" INTEGER NOT NULL,
    "email" VARCHAR(255),
    "mobile" VARCHAR(20),
    "full_name" VARCHAR(255),
    "status" VARCHAR(50),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_recipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_template" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "channel" "ActivityType" NOT NULL,
    "subject" VARCHAR(255),
    "content" TEXT NOT NULL,
    "status" "CampaignTemplateStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_by_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "error_report" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "status" "ErrorReportStatus" NOT NULL DEFAULT 'OPEN',
    "reported_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "error_report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiry" (
    "id" SERIAL NOT NULL,
    "assigned_to_id" INTEGER,
    "status_data_id" INTEGER,
    "priority" VARCHAR(50),
    "description" TEXT,
    "data_received" DATE,
    "source_data_id" INTEGER,
    "regional" VARCHAR(10),
    "group_tele" VARCHAR(50),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "student_id" INTEGER,

    CONSTRAINT "inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "major_data" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "level" "MajorLevel" NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "parent_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "major_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "old_province" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "old_province_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission" (
    "id" SERIAL NOT NULL,
    "resource" VARCHAR(50) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "group_permission" (
    "group_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "group_permission_pkey" PRIMARY KEY ("group_id","permission_id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "old_province_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "school_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_data" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "level" "SourceLevel" NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "parent_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "source_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialized_register" (
    "id" SERIAL NOT NULL,
    "interested_major_id" INTEGER,
    "specific_major_id" INTEGER,
    "admission_year" INTEGER,
    "english_certificate" "EnglishCertificate",
    "gpa" "GPA",
    "program_score" "ProgramScore",
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specialized_register_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_data" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "level" "StatusLevel" NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "parent_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "status_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student" (
    "id" SERIAL NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "gender" VARCHAR(20),
    "email" VARCHAR(255),
    "mobile" VARCHAR(20),
    "other_phone" VARCHAR(20),
    "birth_date" DATE,
    "parent_phone" VARCHAR(20),
    "primary_address" VARCHAR(255),
    "specialized_register_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "user_group" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "group_leader" INTEGER,
    "created_by_id" INTEGER,

    CONSTRAINT "user_group_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inquiry_student_id_key" ON "inquiry"("student_id");

-- CreateIndex
CREATE INDEX "inquiry_created_at_idx" ON "inquiry"("created_at");

-- CreateIndex
CREATE INDEX "inquiry_source_data_id_idx" ON "inquiry"("source_data_id");

-- CreateIndex
CREATE INDEX "major_data_parent_id_idx" ON "major_data"("parent_id");

-- CreateIndex
CREATE INDEX "major_data_level_idx" ON "major_data"("level");

-- CreateIndex
CREATE UNIQUE INDEX "major_data_name_parent_id_key" ON "major_data"("name", "parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "permission_code_key" ON "permission"("code");

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");

-- CreateIndex
CREATE INDEX "school_old_province_id_idx" ON "school"("old_province_id");

-- CreateIndex
CREATE UNIQUE INDEX "school_name_old_province_id_key" ON "school"("name", "old_province_id");

-- CreateIndex
CREATE INDEX "source_data_parent_id_idx" ON "source_data"("parent_id");

-- CreateIndex
CREATE INDEX "source_data_level_idx" ON "source_data"("level");

-- CreateIndex
CREATE UNIQUE INDEX "source_data_name_parent_id_key" ON "source_data"("name", "parent_id");

-- CreateIndex
CREATE INDEX "status_data_parent_id_idx" ON "status_data"("parent_id");

-- CreateIndex
CREATE INDEX "status_data_level_idx" ON "status_data"("level");

-- CreateIndex
CREATE UNIQUE INDEX "status_data_name_parent_id_key" ON "status_data"("name", "parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_mobile_key" ON "student"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "student_specialized_register_id_key" ON "student"("specialized_register_id");

-- CreateIndex
CREATE INDEX "student_mobile_idx" ON "student"("mobile");

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
ALTER TABLE "account" ADD CONSTRAINT "account_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "user_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_activity" ADD CONSTRAINT "campaign_activity_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_activity" ADD CONSTRAINT "campaign_activity_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "campaign_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_recipient" ADD CONSTRAINT "campaign_recipient_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "campaign_activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_recipient" ADD CONSTRAINT "campaign_recipient_inquiry_id_fkey" FOREIGN KEY ("inquiry_id") REFERENCES "inquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_template" ADD CONSTRAINT "campaign_template_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "error_report" ADD CONSTRAINT "error_report_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_status_data_id_fkey" FOREIGN KEY ("status_data_id") REFERENCES "status_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_source_data_id_fkey" FOREIGN KEY ("source_data_id") REFERENCES "source_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "major_data" ADD CONSTRAINT "major_data_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "major_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_permission" ADD CONSTRAINT "group_permission_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "user_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_permission" ADD CONSTRAINT "group_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school" ADD CONSTRAINT "school_old_province_id_fkey" FOREIGN KEY ("old_province_id") REFERENCES "old_province"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_data" ADD CONSTRAINT "source_data_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "source_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialized_register" ADD CONSTRAINT "specialized_register_interested_major_id_fkey" FOREIGN KEY ("interested_major_id") REFERENCES "major_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialized_register" ADD CONSTRAINT "specialized_register_specific_major_id_fkey" FOREIGN KEY ("specific_major_id") REFERENCES "major_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_data" ADD CONSTRAINT "status_data_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "status_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_specialized_register_id_fkey" FOREIGN KEY ("specialized_register_id") REFERENCES "specialized_register"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_education" ADD CONSTRAINT "student_education_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_education" ADD CONSTRAINT "student_education_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "school"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_education" ADD CONSTRAINT "student_education_new_province_id_fkey" FOREIGN KEY ("new_province_id") REFERENCES "new_province"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_education" ADD CONSTRAINT "student_education_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_group" ADD CONSTRAINT "user_group_group_leader_fkey" FOREIGN KEY ("group_leader") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_group" ADD CONSTRAINT "user_group_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

