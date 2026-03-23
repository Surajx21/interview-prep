DELETE FROM "message" AS duplicate
USING "message" AS original
WHERE duplicate."id" > original."id"
  AND duplicate."interview_session_id" = original."interview_session_id"
  AND duplicate."ui_message_id" = original."ui_message_id";
--> statement-breakpoint
CREATE UNIQUE INDEX "message_session_ui_message_id_idx"
ON "message" USING btree ("interview_session_id","ui_message_id");
