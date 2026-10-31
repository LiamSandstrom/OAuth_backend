-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('draft', 'published');

-- CreateTable
CREATE TABLE "post_feedback" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "type" "FeedbackType" NOT NULL,
    "feedback" TEXT NOT NULL,
    "inputHash" TEXT NOT NULL,
    "lastCommentId" INTEGER,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_feedback_postId_type_key" ON "post_feedback"("postId", "type");

-- AddForeignKey
ALTER TABLE "post_feedback" ADD CONSTRAINT "post_feedback_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
