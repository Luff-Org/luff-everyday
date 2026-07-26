-- CreateTable
CREATE TABLE "TodoImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "todoId" TEXT NOT NULL,

    CONSTRAINT "TodoImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TodoImage_todoId_idx" ON "TodoImage"("todoId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Subtask_todoId_idx" ON "Subtask"("todoId");

-- CreateIndex
CREATE INDEX "TestResult_userId_createdAt_idx" ON "TestResult"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Todo_userId_completed_completedAt_idx" ON "Todo"("userId", "completed", "completedAt");

-- CreateIndex
CREATE INDEX "Todo_userId_createdAt_idx" ON "Todo"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "TodoImage" ADD CONSTRAINT "TodoImage_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "Todo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
