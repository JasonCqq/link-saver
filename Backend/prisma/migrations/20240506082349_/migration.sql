-- CreateTable
CREATE TABLE "tempUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "otp" TEXT,
    "otpExpiresAt" TIMESTAMP(3),

    CONSTRAINT "tempUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tempUser_username_key" ON "tempUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "tempUser_email_key" ON "tempUser"("email");
