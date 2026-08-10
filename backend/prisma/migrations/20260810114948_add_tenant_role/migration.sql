/*
  Warnings:

  - You are about to drop the column `category` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Property` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descriptionEn` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationId` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titleEn` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "ListingStatus" ADD VALUE 'UNAVAILABLE';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'TENANT';

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "category",
DROP COLUMN "description",
DROP COLUMN "location",
DROP COLUMN "title",
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "descriptionAm" TEXT,
ADD COLUMN     "descriptionEn" TEXT NOT NULL,
ADD COLUMN     "gpsLat" DOUBLE PRECISION,
ADD COLUMN     "gpsLng" DOUBLE PRECISION,
ADD COLUMN     "landmarkDescription" TEXT,
ADD COLUMN     "locationId" TEXT NOT NULL,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "titleAm" TEXT,
ADD COLUMN     "titleEn" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PropertyImage" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "subCity" TEXT,
    "kebeleOrWoreda" TEXT,
    "region" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "relatedEntityType" TEXT,
    "relatedEntityId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionSetting" (
    "id" TEXT NOT NULL,
    "ratePercent" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "updatedByAdminId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
