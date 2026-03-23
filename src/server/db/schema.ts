import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  pgEnum,
  json,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const authSchema = { user, session, account, verification };

// Interview History Schema - Enums
export const interviewTypeEnum = pgEnum("interview_type", [
  "technical",
  "hr",
  "aptitude",
]);
export const interviewDifficultyEnum = pgEnum("interview_difficulty", [
  "easy",
  "medium",
  "hard",
]);
export const interviewLanguageEnum = pgEnum("interview_language", [
  "javascript",
  "python",
  "java",
  "cpp",
  "react",
  "nodejs",
  "sql",
  "system-design",
]);

export const messageRoleEnum = pgEnum("message_role", [
  "user",
  "assistant",
  "system",
]);

export const verdictEnum = pgEnum("verdict", [
  "excellent",
  "good",
  "average",
  "needs_improvement",
]);

export const interviewSession = pgTable("interview_session", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: interviewTypeEnum("type").notNull(),
  language: interviewLanguageEnum("language").notNull(),
  difficulty: interviewDifficultyEnum("difficulty").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});


export const messageSchema = pgTable(
  "message",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    uiMessageId: text("ui_message_id").notNull(), // The ID from UIMessage
    interviewSessionId: uuid("interview_session_id")
      .notNull()
      .references(() => interviewSession.id, { onDelete: "cascade" }),
    role: messageRoleEnum("role").notNull(),
    parts: json("parts").notNull(), // Array of message parts
    metadata: json("metadata"), // Optional metadata object
    sequenceNumber: integer("sequence_number").notNull(), // Order within the conversation
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("message_session_ui_message_id_idx").on(
      table.interviewSessionId,
      table.uiMessageId,
    ),
  ],
);


// Interview Result Schema
export const interviewResult = pgTable("interview_result", {
  id: uuid("id").primaryKey().defaultRandom(),
  interviewSessionId: uuid("interview_session_id")
    .notNull()
    .unique()
    .references(() => interviewSession.id, { onDelete: "cascade" }),
  accuracyScore: integer("accuracy_score").notNull(), // 0-100
  communicationScore: integer("communication_score").notNull(), // 0-100
  problemSolvingScore: integer("problem_solving_score").notNull(), // 0-100
  consistencyScore: integer("consistency_score").notNull(), // 0-100
  overallScore: integer("overall_score").notNull(), // 0-100
  performanceSummary: text("performance_summary").notNull(), // 3-5 sentences
  verdict: verdictEnum("verdict").notNull(), // excellent | good | average | needs_improvement
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// TypeScript types
export type InterviewSession = typeof interviewSession.$inferSelect;
export type NewInterviewSession = typeof interviewSession.$inferInsert;
export type Message = typeof messageSchema.$inferSelect;
export type NewMessage = typeof messageSchema.$inferInsert;
export type InterviewResult = typeof interviewResult.$inferSelect;
export type NewInterviewResult = typeof interviewResult.$inferInsert;

// UIMessage types for better type safety
export interface UIMessagePart {
  type: "text" | "reasoning" | "source-url" | "image" | "tool" | "tool-result";
  text?: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

export interface UIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  parts: UIMessagePart[];
  metadata?: Record<string, unknown>;
}
