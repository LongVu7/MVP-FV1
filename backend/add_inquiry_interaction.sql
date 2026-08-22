CREATE TYPE "EventName" AS ENUM ('TALKSHOW', 'LIVESTREAM', 'OPEN_DAY', 'COFFEE_TALK', 'CAMPUS_TOUR', 'WORKSHOP', 'ONE_ON_ONE_CONSULTATION');
CREATE TYPE "CompensationStatus" AS ENUM ('REPORTED', 'COMPENSATED');

ALTER TABLE "inquiry"
ADD COLUMN "interaction_at" TIMESTAMPTZ,
ADD COLUMN "call_count" INTEGER,
ADD COLUMN "event_names" "EventName"[] DEFAULT ARRAY[]::"EventName"[],
ADD COLUMN "call_log" TEXT,
ADD COLUMN "record_file" TEXT,
ADD COLUMN "compensation_status" "CompensationStatus";
