-- Migration: add_monitoring_backup_tables
-- Ajout des tables CrudErrorLog, BackupConfig et BackupHistory

-- CreateTable CrudErrorLog (si nexiste pas)
CREATE TABLE IF NOT EXISTS "CrudErrorLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "section" TEXT,
    "errorMessage" TEXT,
    "userId" TEXT,
    "userEmail" TEXT,
    CONSTRAINT "CrudErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable BackupConfig (si nexiste pas)
CREATE TABLE IF NOT EXISTS "BackupConfig" (
    "id" TEXT NOT NULL DEFAULT 'default-config',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gdriveEnabled" BOOLEAN NOT NULL DEFAULT false,
    "gdriveRemoteName" TEXT NOT NULL DEFAULT 'lftg_gdrive',
    "gdrivePath" TEXT NOT NULL DEFAULT 'Backups/LFTG',
    "gdriveConnected" BOOLEAN NOT NULL DEFAULT false,
    "localRetentionDays" INTEGER NOT NULL DEFAULT 7,
    "scheduleEnabled" BOOLEAN NOT NULL DEFAULT true,
    "scheduleHour" INTEGER NOT NULL DEFAULT 3,
    CONSTRAINT "BackupConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable BackupHistory (si nexiste pas)
CREATE TABLE IF NOT EXISTS "BackupHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dbFile" TEXT,
    "uploadsFile" TEXT,
    "dbSize" INTEGER,
    "uploadsSize" INTEGER,
    "duration" INTEGER,
    "gdriveSync" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    CONSTRAINT "BackupHistory_pkey" PRIMARY KEY ("id")
);
