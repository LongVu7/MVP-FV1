CREATE TYPE "StudentClass" AS ENUM ('GRADE_11', 'GRADE_12', 'FREELANCE');
ALTER TABLE "student_education" ADD COLUMN "class" "StudentClass";
