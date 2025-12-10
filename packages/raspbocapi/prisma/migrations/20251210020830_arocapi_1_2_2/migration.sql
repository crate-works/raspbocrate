-- CreateTable
CREATE TABLE `Entity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rocrateId` VARCHAR(2048) NOT NULL,
    `name` VARCHAR(1024) NOT NULL,
    `description` TEXT NOT NULL,
    `entityType` VARCHAR(1024) NOT NULL,
    `memberOf` VARCHAR(2048) NULL,
    `rootCollection` VARCHAR(2048) NULL,
    `metadataLicenseId` VARCHAR(2048) NOT NULL,
    `contentLicenseId` VARCHAR(2048) NOT NULL,
    `fileId` VARCHAR(2048) NULL,
    `rocrate` JSON NOT NULL,
    `meta` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `File` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileId` VARCHAR(2048) NOT NULL,
    `filename` VARCHAR(255) NOT NULL,
    `mediaType` VARCHAR(127) NOT NULL,
    `size` BIGINT NOT NULL,
    `memberOf` VARCHAR(2048) NOT NULL,
    `rootCollection` VARCHAR(2048) NOT NULL,
    `contentLicenseId` VARCHAR(2048) NOT NULL,
    `meta` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `File_fileId_key`(`fileId`(768)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
