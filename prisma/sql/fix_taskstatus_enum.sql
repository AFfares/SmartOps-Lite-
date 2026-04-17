-- Fix Postgres enum drift for TaskStatus so Prisma can write TODO / IN_PROGRESS / DONE.
-- Safe to run multiple times.

-- 1) Inspect current enum labels
SELECT t.typname AS enum_type, e.enumlabel AS value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'TaskStatus'
ORDER BY e.enumsortorder ;

-- 2) Ensure required enum values exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'TaskStatus' AND e.enumlabel = 'TODO'
  ) THEN
    EXECUTE 'ALTER TYPE "TaskStatus" ADD VALUE ''TODO''';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'TaskStatus' AND e.enumlabel = 'IN_PROGRESS'
  ) THEN
    EXECUTE 'ALTER TYPE "TaskStatus" ADD VALUE ''IN_PROGRESS''';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'TaskStatus' AND e.enumlabel = 'DONE'
  ) THEN
    EXECUTE 'ALTER TYPE "TaskStatus" ADD VALUE ''DONE''';
  END IF;
END $$;

-- 3) If older data used PENDING, migrate it to TODO (only if PENDING exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'TaskStatus' AND e.enumlabel = 'PENDING'
  ) THEN
    -- If the table doesn't exist, this no-ops by raising undefined_table; catch and ignore.
    BEGIN
      EXECUTE 'UPDATE "EmployeeTask" SET status = ''TODO'' WHERE status = ''PENDING''';
    EXCEPTION
      WHEN undefined_table THEN
        NULL;
    END;
  END IF;
END $$;

-- 4) Align default value (if the table exists)
DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER TABLE "EmployeeTask" ALTER COLUMN "status" SET DEFAULT ''TODO''::"TaskStatus"';
  EXCEPTION
    WHEN undefined_table THEN
      NULL;
    WHEN undefined_column THEN
      NULL;
  END;
END $$;

-- Re-check after the fix
SELECT t.typname AS enum_type, e.enumlabel AS value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'TaskStatus'
ORDER BY e.enumsortorder;
