CREATE TYPE "public"."interview_difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "public"."interview_language" AS ENUM('javascript', 'python', 'java', 'cpp', 'react', 'nodejs', 'sql', 'system-design');--> statement-breakpoint
CREATE TYPE "public"."interview_type" AS ENUM('technical', 'hr', 'aptitude');--> statement-breakpoint
CREATE TABLE "interview_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" "interview_type" NOT NULL,
	"language" "interview_language" NOT NULL,
	"difficulty" "interview_difficulty" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "interview_session" ADD CONSTRAINT "interview_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;