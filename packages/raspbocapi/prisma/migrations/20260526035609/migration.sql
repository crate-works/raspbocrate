-- CreateTable
CREATE TABLE `entity` (
    `id` VARCHAR(768) NOT NULL,
    `name` VARCHAR(512) NOT NULL,
    `description` TEXT NOT NULL,
    `entityType` VARCHAR(255) NOT NULL,
    `memberOf` VARCHAR(768) NULL,
    `rootCollection` VARCHAR(768) NULL,
    `metadataLicenseId` VARCHAR(255) NOT NULL,
    `contentLicenseId` VARCHAR(255) NOT NULL,
    `meta` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `entity_memberOf_idx`(`memberOf`),
    INDEX `entity_rootCollection_idx`(`rootCollection`),
    INDEX `entity_entityType_idx`(`entityType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `file` (
    `id` VARCHAR(768) NOT NULL,
    `filename` VARCHAR(255) NOT NULL,
    `mediaType` VARCHAR(127) NOT NULL,
    `size` BIGINT NOT NULL,
    `meta` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `file` ADD CONSTRAINT `file_id_fkey` FOREIGN KEY (`id`) REFERENCES `entity`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
