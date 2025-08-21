-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "eventDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "serviceDuration" INTEGER;

-- CreateIndex
CREATE INDEX "Booking_eventDeleted_datetime_idx" ON "Booking"("eventDeleted", "datetime");
