-- CreateTable
CREATE TABLE `meals` (
    `mealId` INTEGER NOT NULL AUTO_INCREMENT,
    `mealCode` TINYINT NOT NULL,
    `mealDate` VARCHAR(10) NOT NULL,
    `mealInfo` JSON NOT NULL,

    PRIMARY KEY (`mealId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscriptions` (
    `subscriptionId` INTEGER NOT NULL AUTO_INCREMENT,
    `subscriptionInfo` LONGTEXT NOT NULL,

    PRIMARY KEY (`subscriptionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
