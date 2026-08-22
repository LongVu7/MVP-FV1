CREATE TYPE "Priority" AS ENUM ('I', 'II', 'III', 'IV', 'V');
ALTER TABLE "student" ADD COLUMN "priority" "Priority";
