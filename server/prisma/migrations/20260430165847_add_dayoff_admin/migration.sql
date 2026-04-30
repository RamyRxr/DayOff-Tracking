-- AlterTable
ALTER TABLE "DayOff" ADD COLUMN     "adminId" TEXT;

-- AddForeignKey
ALTER TABLE "DayOff" ADD CONSTRAINT "DayOff_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
