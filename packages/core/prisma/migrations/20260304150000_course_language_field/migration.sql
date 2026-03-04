-- Add language field to Course
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "language" TEXT DEFAULT 'fr';
