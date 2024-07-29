-- DropForeignKey
ALTER TABLE "rooms" DROP CONSTRAINT "rooms_ownerId_fkey";

-- AlterTable
ALTER TABLE "rooms" ALTER COLUMN "ownerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
