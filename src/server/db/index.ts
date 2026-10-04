import { env } from "@/env";
import * as schema from "@/server/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(env.DATABASE_URL);
export const db = drizzle({ client, schema });