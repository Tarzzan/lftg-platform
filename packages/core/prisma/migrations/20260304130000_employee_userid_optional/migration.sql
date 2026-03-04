-- AlterTable: make userId optional in Employee
ALTER TABLE "Employee" ALTER COLUMN "userId" DROP NOT NULL;
