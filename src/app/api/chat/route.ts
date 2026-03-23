import { auth } from "@/lib/auth";
import { env } from "@/env";
import { api } from "@/trpc/server";
import { db } from "@/server/db";
import { interviewSession } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { headers } from "next/headers";
import { createGateway } from "@ai-sdk/gateway";

// Types for the request body
interface ChatRequestBody {
  id: string;
  messages: UIMessage[];
  trigger: string;
}

// Helper function to convert UIMessage to our database format
function convertUIMessageToDbFormat(uiMessage: UIMessage) {
  return {
    id: uiMessage.id,
    role: uiMessage.role,
    parts: uiMessage.parts.map((part) => {
      const dbPart: {
        type:
          | "text"
          | "reasoning"
          | "source-url"
          | "image"
          | "tool"
          | "tool-result";
        text?: string;
        url?: string;
        metadata?: Record<string, unknown>;
      } = {
        type: part.type as
          | "text"
          | "reasoning"
          | "source-url"
          | "image"
          | "tool"
          | "tool-result",
      };

      if ("text" in part && typeof part.text === "string") {
        dbPart.text = part.text;
      }
      if ("url" in part && typeof part.url === "string") {
        dbPart.url = part.url;
      }
      if ("metadata" in part && part.metadata) {
        dbPart.metadata = part.metadata as Record<string, unknown>;
      }
      return dbPart;
    }),
    metadata: uiMessage.metadata as Record<string, unknown> | undefined,
  };
}

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const data = (await req.json()) as ChatRequestBody;

    // Validate required fields
    if (!data.id || !data.messages || !Array.isArray(data.messages)) {
      return new Response("Invalid request body", { status: 400 });
    }

    const { messages, id: interviewSessionId } = data;

    // Verify the session belongs to the authenticated user
    const [sessionRow] = await db
      .select({ userId: interviewSession.userId })
      .from(interviewSession)
      .where(eq(interviewSession.id, interviewSessionId));

    if (!sessionRow) {
      return new Response("Interview session not found", { status: 404 });
    }

    if (sessionRow.userId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    // Save the latest user message to the database
    const latestUserMessage = [...messages]
      .reverse()
      .find((msg) => msg.role === "user");

    if (latestUserMessage) {
      try {
        await api.message.insertUIMessage({
          interviewSessionId,
          uiMessage: convertUIMessageToDbFormat(latestUserMessage),
        });
      } catch (error) {
        console.error("Error saving user message:", error);
      }
    }

    const gateway = createGateway({
      apiKey: env.AI_GATEWAY_API_KEY,
    });

    const result = streamText({
      model: gateway("openai/gpt-4.1-mini"),
      messages: convertToModelMessages(messages),
      onError: (error) => {
        console.error(error);
      },
      onFinish: async (result) => {
        // Save assistant response to database
        try {
          const assistantMessage = {
            id: crypto.randomUUID(),
            role: "assistant" as const,
            parts: [{ type: "text" as const, text: result.text }],
            metadata: { interviewSessionId },
          };

          await api.message.insertUIMessage({
            interviewSessionId,
            uiMessage: assistantMessage,
          });
        } catch (error) {
          console.error("Error saving assistant message:", error);
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error parsing request body:", error);
    return new Response("Invalid JSON in request body", { status: 400 });
  }
}
