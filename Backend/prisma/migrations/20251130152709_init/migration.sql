/*
  Warnings:

  - You are about to drop the `CVAnalysis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InterviewSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SkillGap` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "CVAnalysis";

-- DropTable
DROP TABLE "InterviewSession";

-- DropTable
DROP TABLE "SkillGap";

-- CreateTable
CREATE TABLE "CVHistory" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "analysis" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CVHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewHistory" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "feedback" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillGapHistory" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "skills" JSONB NOT NULL,
    "gap" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillGapHistory_pkey" PRIMARY KEY ("id")
);
