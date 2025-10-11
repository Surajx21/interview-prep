import { auth } from "@/lib/auth";
import { api } from "@/trpc/server";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { headers } from "next/headers";
// import { createOpenAI } from "@ai-sdk/openai";
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

  const { api_key } = await api.profile.getApiKey();

  if (!api_key) {
    return new Response("Please set your API key in your profile", {
      status: 401,
    });
  }

  try {
    const data = (await req.json()) as ChatRequestBody;

    // Validate required fields
    if (!data.id || !data.messages || !Array.isArray(data.messages)) {
      return new Response("Invalid request body", { status: 400 });
    }

    const { messages } = data;

    // Extract interview session ID from metadata
    const interviewSessionId = data.id;

    if (!interviewSessionId) {
      return new Response("Missing interview session ID", { status: 400 });
    }

    // Save user message to database
    const userMessages = messages.filter((msg) => msg.role === "user");
    if (userMessages.length > 0) {
      const latestUserMessage = userMessages[userMessages.length - 1];
      if (latestUserMessage) {
        try {
          const uiMessageForDb = convertUIMessageToDbFormat(latestUserMessage);
          await api.message.insertUIMessage({
            interviewSessionId,
            uiMessage: uiMessageForDb,
          });
        } catch (error) {
          console.error("Error saving user message:", error);
        }
      }
    }

    // return new Response("Invalid request body", { status: 400 });
    const gateway = createGateway({
      apiKey: api_key,
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
            id: `assistant-${Date.now()}`,
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